import requests
import sys
import json
from datetime import datetime

class TutorMavenAPITester:
    def __init__(self, base_url="https://learnhub-498.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}  # Store tokens for different users
        self.users = {}   # Store user data
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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token_key=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if token_key and token_key in self.tokens:
            test_headers['Authorization'] = f'Bearer {self.tokens[token_key]}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_student_registration(self):
        """Test student registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        student_data = {
            "email": f"student_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test Student {timestamp}",
            "role": "student"
        }
        
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data=student_data
        )
        
        if success and 'token' in response:
            self.tokens['student'] = response['token']
            self.users['student'] = response['user']
            return True
        return False

    def test_tutor_registration(self):
        """Test tutor registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        tutor_data = {
            "email": f"tutor_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test Tutor {timestamp}",
            "role": "tutor"
        }
        
        success, response = self.run_test(
            "Tutor Registration",
            "POST",
            "auth/register",
            200,
            data=tutor_data
        )
        
        if success and 'token' in response:
            self.tokens['tutor'] = response['token']
            self.users['tutor'] = response['user']
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"password": "653165"}
        )
        
        if success and 'token' in response:
            self.tokens['admin'] = response['token']
            self.users['admin'] = response['user']
            return True
        return False

    def test_tutor_profile_update(self):
        """Test tutor profile update"""
        if 'tutor' not in self.tokens:
            return False
            
        profile_data = {
            "bio": "Experienced math tutor with 5 years of teaching",
            "subjects": ["Mathematics", "Physics"],
            "monthly_fee": 2000,
            "education": "M.Sc Mathematics",
            "coaching_address": "123 Test Street, Test City",
            "contact_number": "+91 9876543210",
            "teaching_days": ["Mon", "Wed", "Fri"],
            "hours_per_day": 6,
            "boards": ["CBSE", "ICSE"]
        }
        
        success, response = self.run_test(
            "Tutor Profile Update",
            "PUT",
            "tutors/profile",
            200,
            data=profile_data,
            token_key='tutor'
        )
        return success

    def test_student_profile_update(self):
        """Test student profile update"""
        if 'student' not in self.tokens:
            return False
            
        profile_data = {
            "school_name": "Test High School",
            "board": "CBSE",
            "subjects_interested": ["Mathematics", "Science"]
        }
        
        success, response = self.run_test(
            "Student Profile Update",
            "PUT",
            "students/profile",
            200,
            data=profile_data,
            token_key='student'
        )
        return success

    def test_add_class(self):
        """Test adding a class for tutor"""
        if 'tutor' not in self.tokens:
            return False
            
        success, response = self.run_test(
            "Add Class",
            "POST",
            "classes",
            200,
            data={
                "class_range": "9-10",
                "subjects": ["Mathematics", "Physics"]
            },
            token_key='tutor'
        )
        return success

    def test_verification_submission(self):
        """Test verification submission"""
        if 'tutor' not in self.tokens:
            return False
            
        success, response = self.run_test(
            "Verification Submission",
            "POST",
            "tutors/verification",
            200,
            data={
                "proof_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                "phone_number": "+91 9876543210"
            },
            token_key='tutor'
        )
        return success

    def test_subscription_flow(self):
        """Test subscription creation and management"""
        if 'student' not in self.tokens or 'tutor' not in self.users:
            return False
            
        # Student subscribes to tutor
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "subscriptions",
            200,
            data={"tutor_id": self.users['tutor']['id']},
            token_key='student'
        )
        
        if not success:
            return False
            
        # Get subscription ID
        success, subs = self.run_test(
            "Get Tutor Subscriptions",
            "GET",
            "subscriptions/my",
            200,
            token_key='tutor'
        )
        
        if success and subs:
            sub_id = subs[0]['id']
            
            # Accept subscription
            success, response = self.run_test(
                "Accept Subscription",
                "PUT",
                f"subscriptions/accept/{sub_id}",
                200,
                token_key='tutor'
            )
            return success
        return False

    def test_fee_management(self):
        """Test fee management"""
        if 'tutor' not in self.tokens:
            return False
            
        # Get subscriptions first
        success, subs = self.run_test(
            "Get Subscriptions for Fee Test",
            "GET",
            "subscriptions/my",
            200,
            token_key='tutor'
        )
        
        if success and subs:
            sub_id = subs[0]['id']
            
            # Update fee status
            success, response = self.run_test(
                "Update Fee Status",
                "PUT",
                f"fees/{sub_id}?month=1&year=2025&fee_status=paid",
                200,
                token_key='tutor'
            )
            return success
        return False

    def test_attendance_marking(self):
        """Test attendance marking"""
        if 'tutor' not in self.tokens:
            return False
            
        # Get subscriptions first
        success, subs = self.run_test(
            "Get Subscriptions for Attendance Test",
            "GET",
            "subscriptions/my",
            200,
            token_key='tutor'
        )
        
        if success and subs:
            sub_id = subs[0]['id']
            today = datetime.now().strftime('%Y-%m-%d')
            
            # Mark attendance
            success, response = self.run_test(
                "Mark Attendance",
                "POST",
                f"attendance/{sub_id}?date={today}&attendance_status=present",
                200,
                token_key='tutor'
            )
            return success
        return False

    def test_review_system(self):
        """Test review creation and deletion"""
        if 'student' not in self.tokens or 'tutor' not in self.users:
            return False
            
        # Create review
        success, response = self.run_test(
            "Create Review",
            "POST",
            "reviews",
            200,
            data={
                "tutor_id": self.users['tutor']['id'],
                "rating": 5,
                "comment": "Excellent tutor! Very helpful and knowledgeable."
            },
            token_key='student'
        )
        
        if not success:
            return False
            
        # Get tutor details to find review ID
        success, tutor_data = self.run_test(
            "Get Tutor Details for Review",
            "GET",
            f"tutors/{self.users['tutor']['id']}",
            200
        )
        
        if success and tutor_data.get('reviews'):
            review_id = tutor_data['reviews'][0]['id']
            
            # Delete review
            success, response = self.run_test(
                "Delete Review",
                "DELETE",
                f"reviews/{review_id}",
                200,
                token_key='student'
            )
            return success
        return False

    def test_admin_verification_approval(self):
        """Test admin verification approval"""
        if 'admin' not in self.tokens or 'tutor' not in self.users:
            return False
            
        # Get pending verifications
        success, verifications = self.run_test(
            "Get Pending Verifications",
            "GET",
            "admin/verifications",
            200,
            token_key='admin'
        )
        
        if success and verifications:
            # Approve first verification
            user_id = verifications[0]['user_id']
            success, response = self.run_test(
                "Approve Verification",
                "PUT",
                f"admin/verifications/{user_id}/approve",
                200,
                token_key='admin'
            )
            return success
        return True  # No pending verifications is also OK

    def test_banner_upload(self):
        """Test banner upload for verified tutors"""
        if 'tutor' not in self.tokens:
            return False
            
        success, response = self.run_test(
            "Upload Banner",
            "POST",
            "tutors/banner",
            200,
            data={"banner": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="},
            token_key='tutor'
        )
        return success

    def test_parent_login(self):
        """Test parent login with student code"""
        if 'student' not in self.users:
            return False
            
        # Get student profile to get parent code
        success, profile = self.run_test(
            "Get Student Profile for Parent Code",
            "GET",
            f"students/profile/{self.users['student']['id']}",
            200
        )
        
        if success and profile and profile.get('parent_code'):
            parent_code = profile['parent_code']
            
            success, response = self.run_test(
                "Parent Login",
                "POST",
                "parents/login",
                200,
                data={"parent_code": parent_code}
            )
            return success
        return False

    def test_notifications(self):
        """Test notifications system"""
        if 'student' not in self.tokens:
            return False
            
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            "notifications",
            200,
            token_key='student'
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting TutorMaven API Tests...")
        print("=" * 50)
        
        # Authentication tests
        print("\n📝 Testing Authentication...")
        self.test_student_registration()
        self.test_tutor_registration()
        self.test_admin_login()
        
        # Profile management tests
        print("\n👤 Testing Profile Management...")
        self.test_tutor_profile_update()
        self.test_student_profile_update()
        self.test_add_class()
        
        # Verification system tests
        print("\n✅ Testing Verification System...")
        self.test_verification_submission()
        self.test_admin_verification_approval()
        self.test_banner_upload()
        
        # Subscription and learning management tests
        print("\n📚 Testing Learning Management...")
        self.test_subscription_flow()
        self.test_fee_management()
        self.test_attendance_marking()
        self.test_review_system()
        
        # Parent and notification tests
        print("\n👨‍👩‍👧‍👦 Testing Parent Portal & Notifications...")
        self.test_parent_login()
        self.test_notifications()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = TutorMavenAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())