import requests
import sys
import json
from datetime import datetime

class KuponBackendTester:
    def __init__(self, base_url="https://kupon-paylas.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        print("\n👤 Testing User Authentication...")
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"username": "testuser", "password": "123456"}
        )
        if success and 'token' in response:
            self.user_token = response['token']
            return True
        return False

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            print("❌ Skipping admin tests - no admin token")
            return

        print("\n🛠️ Testing Admin Endpoints...")
        headers = {'Authorization': f'Bearer {self.admin_token}'}

        # Test admin dashboard data
        self.run_test("Get Pending Users", "GET", "admin/pending-users", 200, headers=headers)
        self.run_test("Get All Users", "GET", "admin/users", 200, headers=headers)
        self.run_test("Get Coupon Templates", "GET", "admin/coupons", 200, headers=headers)
        self.run_test("Get Withdrawal Requests", "GET", "admin/withdrawals", 200, headers=headers)
        self.run_test("Get Settings", "GET", "admin/settings", 200, headers=headers)

        # Test coupon template creation
        coupon_data = {
            "name": "Test Kupon",
            "consultant_name": "Test Danışman",
            "bet_amount": 1000,
            "status": "kazandi",
            "matches": [
                {
                    "teams": "FB - GS",
                    "prediction": "SKOR TAHMİNİ",
                    "result": "2-1",
                    "odds": 2.5,
                    "is_correct": True
                }
            ]
        }
        self.run_test("Create Coupon Template", "POST", "admin/coupons", 200, data=coupon_data, headers=headers)

        # Test user creation
        user_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "phone": "5551234567",
            "password": "123456",
            "balance": 5000
        }
        self.run_test("Create User", "POST", "admin/users/create", 200, data=user_data, headers=headers)

        # Test settings update
        settings_data = {
            "iban_holder": "Test Hesap Sahibi",
            "bank_name": "Test Bankası",
            "iban": "TR123456789012345678901234",
            "whatsapp": "905551234567"
        }
        self.run_test("Update Settings", "PUT", "admin/settings", 200, data=settings_data, headers=headers)

    def test_user_endpoints(self):
        """Test user endpoints"""
        if not self.user_token:
            print("❌ Skipping user tests - no user token")
            return

        print("\n👤 Testing User Endpoints...")
        headers = {'Authorization': f'Bearer {self.user_token}'}

        # Test user data access
        self.run_test("Get User Coupon", "GET", "user/coupon", 200, headers=headers)
        self.run_test("Get User Balance", "GET", "user/balance", 200, headers=headers)
        self.run_test("Get Withdrawal Status", "GET", "user/withdrawal-status", 200, headers=headers)

        # Test withdrawal request
        withdraw_data = {
            "iban": "TR123456789012345678901234",
            "bank_name": "Test Bank",
            "iban_holder": "Test User"
        }
        self.run_test("Create Withdrawal Request", "POST", "user/withdraw", 200, data=withdraw_data, headers=headers)

    def test_public_endpoints(self):
        """Test public endpoints"""
        print("\n🌐 Testing Public Endpoints...")
        
        # Test public settings
        self.run_test("Get Public Settings", "GET", "settings/public", 200)
        
        # Test seed admin (should work or return already exists)
        success, response = self.run_test("Seed Admin", "POST", "seed-admin", 200)
        if not success:
            # Try again, might already exist
            self.run_test("Seed Admin (Already Exists)", "POST", "seed-admin", 200)

    def test_auth_protection(self):
        """Test that protected endpoints require authentication"""
        print("\n🔒 Testing Authentication Protection...")
        
        # Test admin endpoints without token
        self.run_test("Admin Users (No Auth)", "GET", "admin/users", 401)
        self.run_test("Admin Coupons (No Auth)", "GET", "admin/coupons", 401)
        
        # Test user endpoints without token
        self.run_test("User Balance (No Auth)", "GET", "user/balance", 401)
        self.run_test("User Coupon (No Auth)", "GET", "user/coupon", 401)

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Kupon Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test public endpoints first
        self.test_public_endpoints()
        
        # Test authentication protection
        self.test_auth_protection()
        
        # Test admin login and endpoints
        if self.test_admin_login():
            self.test_admin_endpoints()
        
        # Test user login and endpoints  
        if self.test_user_login():
            self.test_user_endpoints()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KuponBackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2, ensure_ascii=False)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())