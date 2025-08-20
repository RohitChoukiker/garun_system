#!/usr/bin/env python3
"""
Test script for the complaint system
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Total complaints: {data.get('total_complaints', 0)}")
            return True
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_add_complaint():
    """Test adding a complaint"""
    try:
        response = requests.post(f"{BASE_URL}/api/test/add-complaint")
        print(f"Add test complaint: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Test complaint added: {data.get('complaint_id')}")
            return True
    except Exception as e:
        print(f"Add complaint failed: {e}")
        return False

def test_get_all_complaints():
    """Test getting all complaints"""
    try:
        response = requests.get(f"{BASE_URL}/api/complaints/all")
        print(f"Get all complaints: {response.status_code}")
        if response.ok:
            data = response.json()
            complaints = data.get('complaints', [])
            print(f"Total complaints: {len(complaints)}")
            for complaint in complaints:
                print(f"  - {complaint['id']}: {complaint['title']} ({complaint['status']})")
            return True
    except Exception as e:
        print(f"Get complaints failed: {e}")
        return False

def test_get_user_complaints():
    """Test getting user complaints"""
    try:
        # Test with the contact number from the test complaint
        response = requests.get(f"{BASE_URL}/api/complaints/user/9876543210")
        print(f"Get user complaints: {response.status_code}")
        if response.ok:
            data = response.json()
            complaints = data.get('complaints', [])
            print(f"User complaints: {len(complaints)}")
            for complaint in complaints:
                print(f"  - {complaint['id']}: {complaint['title']} ({complaint['status']})")
            return True
    except Exception as e:
        print(f"Get user complaints failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Complaint System")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("❌ Health check failed")
        return
    
    # Test adding complaint
    if not test_add_complaint():
        print("❌ Add complaint failed")
        return
    
    # Test getting all complaints
    if not test_get_all_complaints():
        print("❌ Get all complaints failed")
        return
    
    # Test getting user complaints
    if not test_get_user_complaints():
        print("❌ Get user complaints failed")
        return
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    main()
