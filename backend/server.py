from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'kupon-paylas-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str
    phone: str
    role: str = "user"  # admin or user

class UserCreate(BaseModel):
    username: str
    phone: str
    password: str
    deposit_amount: float = 0

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    balance: float = 0
    status: str = "pending"  # pending, active, rejected
    coupon_id: Optional[str] = None
    tax_status: str = "temiz"
    iban: Optional[str] = None
    bank_name: Optional[str] = None
    iban_holder: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    withdrawal_status: Optional[str] = None  # None, western_pending, western_paid, masak_pending, masak_paid, reviewing, completed

class CouponTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    consultant_name: str = "Bahis Danışmanı"
    matches: List[dict] = []  # [{team1, team2, prediction, odds, result, is_correct}]
    total_odds: float = 1.0
    bet_amount: float = 0
    max_win: float = 0
    status: str = "kazandi"  # kazandi, kaybetti
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CouponTemplateCreate(BaseModel):
    name: str
    consultant_name: str = "Bahis Danışmanı"
    matches: List[dict] = []
    bet_amount: float = 0
    status: str = "kazandi"

class WithdrawalRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    phone: str
    amount: float
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WesternUnionPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    withdrawal_amount: float
    fee_percentage: float = 7.5
    fee_amount: float
    total_to_pay: float
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MasakPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    transfer_amount: float
    fee_percentage: float = 15
    fee_amount: float
    bonus_amount: float = 0
    total_to_pay: float
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaxPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    tax_amount: float
    dekont_ref: str
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivationPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    phone: str
    amount: float
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "main_settings"
    iban_holder: str = ""
    bank_name: str = ""
    iban: str = ""
    whatsapp: str = ""

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Kullanıcı adı zaten mevcut")
    
    user = User(
        username=user_data.username,
        phone=user_data.phone,
        role="user",
        balance=user_data.deposit_amount
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create activation request
    activation = ActivationPayment(
        user_id=user.id,
        username=user.username,
        phone=user_data.phone,
        amount=user_data.deposit_amount
    )
    activation_dict = activation.model_dump()
    activation_dict['created_at'] = activation_dict['created_at'].isoformat()
    await db.activation_payments.insert_one(activation_dict)
    
    return {"message": "Kayıt başarılı. Yönetici onayı bekleniyor.", "user_id": user.id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    
    if not verify_password(credentials.password, user.get('password', '')):
        raise HTTPException(status_code=401, detail="Şifre yanlış")
    
    if user.get('status') == 'pending':
        raise HTTPException(status_code=403, detail="Hesabınız henüz onaylanmadı")
    
    if user.get('status') == 'rejected':
        raise HTTPException(status_code=403, detail="Hesabınız reddedildi")
    
    token = create_access_token({"sub": user['id'], "role": user['role']})
    
    user_response = {k: v for k, v in user.items() if k != 'password'}
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ============ ADMIN USER MANAGEMENT ============

@api_router.get("/admin/pending-users")
async def get_pending_users(admin: dict = Depends(get_admin_user)):
    activations = await db.activation_payments.find({"status": "pending"}, {"_id": 0}).to_list(100)
    return activations

@api_router.get("/admin/users")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({"role": "user", "status": "active"}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.post("/admin/users/approve/{user_id}")
async def approve_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"status": "active"}})
    await db.activation_payments.update_one({"user_id": user_id}, {"$set": {"status": "approved"}})
    return {"message": "Kullanıcı onaylandı"}

@api_router.post("/admin/users/reject/{user_id}")
async def reject_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"status": "rejected"}})
    await db.activation_payments.update_one({"user_id": user_id}, {"$set": {"status": "rejected"}})
    return {"message": "Kullanıcı reddedildi"}

@api_router.post("/admin/users/create")
async def admin_create_user(user_data: dict, admin: dict = Depends(get_admin_user)):
    existing = await db.users.find_one({"username": user_data['username']})
    if existing:
        raise HTTPException(status_code=400, detail="Kullanıcı adı zaten mevcut")
    
    user = User(
        username=user_data['username'],
        phone=user_data.get('phone', ''),
        role="user",
        balance=user_data.get('balance', 0),
        status="active",
        coupon_id=user_data.get('coupon_id')
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.get('password', '123456'))
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    return {"message": "Kullanıcı oluşturuldu", "user_id": user.id}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.delete_one({"id": user_id})
    return {"message": "Kullanıcı silindi"}

@api_router.put("/admin/users/{user_id}/coupon")
async def assign_coupon(user_id: str, data: dict, admin: dict = Depends(get_admin_user)):
    coupon = await db.coupon_templates.find_one({"id": data['coupon_id']}, {"_id": 0})
    if coupon:
        await db.users.update_one(
            {"id": user_id}, 
            {"$set": {"coupon_id": data['coupon_id'], "balance": coupon.get('max_win', 0)}}
        )
    return {"message": "Kupon atandı"}

# ============ COUPON TEMPLATES ============

@api_router.get("/admin/coupons")
async def get_coupon_templates(admin: dict = Depends(get_admin_user)):
    coupons = await db.coupon_templates.find({}, {"_id": 0}).to_list(100)
    return coupons

@api_router.post("/admin/coupons")
async def create_coupon_template(coupon_data: CouponTemplateCreate, admin: dict = Depends(get_admin_user)):
    total_odds = 1.0
    for match in coupon_data.matches:
        total_odds *= float(match.get('odds', 1))
    
    max_win = coupon_data.bet_amount * total_odds
    
    coupon = CouponTemplate(
        name=coupon_data.name,
        consultant_name=coupon_data.consultant_name,
        matches=coupon_data.matches,
        total_odds=round(total_odds, 2),
        bet_amount=coupon_data.bet_amount,
        max_win=round(max_win, 2),
        status=coupon_data.status
    )
    coupon_dict = coupon.model_dump()
    coupon_dict['created_at'] = coupon_dict['created_at'].isoformat()
    
    await db.coupon_templates.insert_one(coupon_dict)
    return {"message": "Kupon şablonu oluşturuldu", "coupon_id": coupon.id}

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon_template(coupon_id: str, admin: dict = Depends(get_admin_user)):
    await db.coupon_templates.delete_one({"id": coupon_id})
    return {"message": "Kupon şablonu silindi"}

# ============ WITHDRAWAL REQUESTS ============

@api_router.get("/admin/withdrawals")
async def get_withdrawal_requests(admin: dict = Depends(get_admin_user)):
    withdrawals = await db.withdrawal_requests.find({}, {"_id": 0}).to_list(100)
    return withdrawals

@api_router.post("/admin/withdrawals/approve/{request_id}")
async def approve_withdrawal(request_id: str, admin: dict = Depends(get_admin_user)):
    await db.withdrawal_requests.update_one({"id": request_id}, {"$set": {"status": "approved"}})
    return {"message": "Çekim talebi onaylandı"}

@api_router.post("/admin/withdrawals/reject/{request_id}")
async def reject_withdrawal(request_id: str, admin: dict = Depends(get_admin_user)):
    await db.withdrawal_requests.update_one({"id": request_id}, {"$set": {"status": "rejected"}})
    return {"message": "Çekim talebi reddedildi"}

# ============ TAX PAYMENTS (DEKONT) ============

@api_router.get("/admin/tax-payments")
async def get_tax_payments(admin: dict = Depends(get_admin_user)):
    payments = await db.tax_payments.find({}, {"_id": 0}).to_list(100)
    return payments

@api_router.post("/admin/tax-payments/approve/{payment_id}")
async def approve_tax_payment(payment_id: str, admin: dict = Depends(get_admin_user)):
    payment = await db.tax_payments.find_one({"id": payment_id}, {"_id": 0})
    if payment:
        await db.tax_payments.update_one({"id": payment_id}, {"$set": {"status": "approved"}})
        await db.users.update_one({"id": payment['user_id']}, {"$set": {"tax_status": "temiz"}})
    return {"message": "Vergi ödemesi onaylandı"}

@api_router.post("/admin/tax-payments/reject/{payment_id}")
async def reject_tax_payment(payment_id: str, admin: dict = Depends(get_admin_user)):
    await db.tax_payments.update_one({"id": payment_id}, {"$set": {"status": "rejected"}})
    return {"message": "Vergi ödemesi reddedildi"}

# ============ WESTERN UNION ============

@api_router.get("/admin/western-union")
async def get_western_union_payments(admin: dict = Depends(get_admin_user)):
    payments = await db.western_union_payments.find({}, {"_id": 0}).to_list(100)
    return payments

@api_router.post("/admin/western-union/approve/{payment_id}")
async def approve_western_union(payment_id: str, admin: dict = Depends(get_admin_user)):
    payment = await db.western_union_payments.find_one({"id": payment_id}, {"_id": 0})
    if payment:
        await db.western_union_payments.update_one({"id": payment_id}, {"$set": {"status": "approved"}})
        await db.users.update_one({"id": payment['user_id']}, {"$set": {"withdrawal_status": "masak_pending"}})
    return {"message": "Western Union ödemesi onaylandı"}

@api_router.post("/admin/western-union/reject/{payment_id}")
async def reject_western_union(payment_id: str, admin: dict = Depends(get_admin_user)):
    await db.western_union_payments.update_one({"id": payment_id}, {"$set": {"status": "rejected"}})
    return {"message": "Western Union ödemesi reddedildi"}

# ============ MASAK ============

@api_router.get("/admin/masak")
async def get_masak_payments(admin: dict = Depends(get_admin_user)):
    payments = await db.masak_payments.find({}, {"_id": 0}).to_list(100)
    return payments

@api_router.post("/admin/masak/approve/{payment_id}")
async def approve_masak(payment_id: str, admin: dict = Depends(get_admin_user)):
    payment = await db.masak_payments.find_one({"id": payment_id}, {"_id": 0})
    if payment:
        await db.masak_payments.update_one({"id": payment_id}, {"$set": {"status": "approved"}})
        await db.users.update_one({"id": payment['user_id']}, {"$set": {"withdrawal_status": "reviewing"}})
    return {"message": "MASAK ödemesi onaylandı"}

@api_router.post("/admin/masak/reject/{payment_id}")
async def reject_masak(payment_id: str, admin: dict = Depends(get_admin_user)):
    await db.masak_payments.update_one({"id": payment_id}, {"$set": {"status": "rejected"}})
    return {"message": "MASAK ödemesi reddedildi"}

# ============ ACTIVATION ONAY ============

@api_router.get("/admin/activations")
async def get_activation_payments(admin: dict = Depends(get_admin_user)):
    payments = await db.activation_payments.find({}, {"_id": 0}).to_list(100)
    return payments

# ============ SETTINGS ============

@api_router.get("/admin/settings")
async def get_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.settings.find_one({"id": "main_settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        settings = default_settings.model_dump()
        await db.settings.insert_one(settings)
        return default_settings.model_dump()
    return settings

@api_router.put("/admin/settings")
async def update_settings(settings_data: dict, admin: dict = Depends(get_admin_user)):
    settings_data['id'] = "main_settings"
    await db.settings.update_one(
        {"id": "main_settings"}, 
        {"$set": settings_data}, 
        upsert=True
    )
    return {"message": "Ayarlar güncellendi"}

# ============ USER ROUTES ============

@api_router.get("/user/coupon")
async def get_user_coupon(current_user: dict = Depends(get_current_user)):
    if not current_user.get('coupon_id'):
        return None
    coupon = await db.coupon_templates.find_one({"id": current_user['coupon_id']}, {"_id": 0})
    return coupon

@api_router.get("/user/balance")
async def get_user_balance(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    return {"balance": user.get('balance', 0), "withdrawal_status": user.get('withdrawal_status')}

@api_router.post("/user/withdraw")
async def request_withdrawal(data: dict, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    
    # Update user IBAN info
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {
            "iban": data.get('iban'),
            "bank_name": data.get('bank_name'),
            "iban_holder": data.get('iban_holder'),
            "withdrawal_status": "western_pending"
        }}
    )
    
    withdrawal = WithdrawalRequest(
        user_id=current_user['id'],
        username=current_user['username'],
        phone=current_user.get('phone', ''),
        amount=user.get('balance', 0)
    )
    withdrawal_dict = withdrawal.model_dump()
    withdrawal_dict['created_at'] = withdrawal_dict['created_at'].isoformat()
    
    await db.withdrawal_requests.insert_one(withdrawal_dict)
    return {"message": "Çekim talebi oluşturuldu", "withdrawal_id": withdrawal.id}

@api_router.get("/user/withdrawal-status")
async def get_withdrawal_status(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    settings = await db.settings.find_one({"id": "main_settings"}, {"_id": 0})
    
    return {
        "status": user.get('withdrawal_status'),
        "balance": user.get('balance', 0),
        "iban": user.get('iban'),
        "iban_holder": user.get('iban_holder'),
        "bank_name": user.get('bank_name'),
        "settings": settings
    }

@api_router.post("/user/western-union-payment")
async def create_western_union_payment(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    withdrawal_amount = user.get('balance', 0)
    fee_percentage = 7.5
    fee_amount = withdrawal_amount * (fee_percentage / 100)
    
    payment = WesternUnionPayment(
        user_id=current_user['id'],
        username=current_user['username'],
        withdrawal_amount=withdrawal_amount,
        fee_percentage=fee_percentage,
        fee_amount=round(fee_amount, 2),
        total_to_pay=round(fee_amount, 2)
    )
    payment_dict = payment.model_dump()
    payment_dict['created_at'] = payment_dict['created_at'].isoformat()
    
    await db.western_union_payments.insert_one(payment_dict)
    await db.users.update_one({"id": current_user['id']}, {"$set": {"withdrawal_status": "western_paid"}})
    
    return {"message": "Western Union ödeme kaydı oluşturuldu", "payment": payment_dict}

@api_router.post("/user/masak-payment")
async def create_masak_payment(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    transfer_amount = user.get('balance', 0)
    fee_percentage = 15
    fee_amount = transfer_amount * (fee_percentage / 100)
    bonus_amount = transfer_amount * 0.35  # 35% bonus
    
    payment = MasakPayment(
        user_id=current_user['id'],
        username=current_user['username'],
        transfer_amount=transfer_amount,
        fee_percentage=fee_percentage,
        fee_amount=round(fee_amount, 2),
        bonus_amount=round(bonus_amount, 2),
        total_to_pay=round(fee_amount, 2)
    )
    payment_dict = payment.model_dump()
    payment_dict['created_at'] = payment_dict['created_at'].isoformat()
    
    await db.masak_payments.insert_one(payment_dict)
    await db.users.update_one({"id": current_user['id']}, {"$set": {"withdrawal_status": "masak_paid"}})
    
    return {"message": "MASAK ödeme kaydı oluşturuldu", "payment": payment_dict}

@api_router.post("/user/complete-withdrawal")
async def complete_withdrawal(current_user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": current_user['id']}, {"$set": {"withdrawal_status": "completed"}})
    return {"message": "Çekim işlemi tamamlandı"}

@api_router.get("/settings/public")
async def get_public_settings():
    settings = await db.settings.find_one({"id": "main_settings"}, {"_id": 0})
    if not settings:
        return {"iban_holder": "", "bank_name": "", "iban": "", "whatsapp": ""}
    return settings

# ============ SEED ADMIN ============

@api_router.post("/seed-admin")
async def seed_admin():
    existing = await db.users.find_one({"username": "admin"})
    if existing:
        return {"message": "Admin zaten mevcut"}
    
    admin = User(
        username="admin",
        phone="5555555555",
        role="admin",
        status="active"
    )
    admin_dict = admin.model_dump()
    admin_dict['password'] = hash_password("admin123")
    admin_dict['created_at'] = admin_dict['created_at'].isoformat()
    
    await db.users.insert_one(admin_dict)
    return {"message": "Admin oluşturuldu", "username": "admin", "password": "admin123"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
