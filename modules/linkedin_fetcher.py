import httpx
import re
from typing import Dict, Any


class LinkedInProfileFetcher:
    """Fetch and process essential LinkedIn profile data"""

    BASE_URL = "https://notes.cleve.ai/api/linkedin-unwrapped"
    TIMEOUT_SETTINGS = httpx.Timeout(
        connect=10.0,
        read=30.0,
        write=10.0,
        pool=10.0
    )

    @staticmethod
    def _validate_linkedin_username(username: str) -> bool:
        """Validate LinkedIn username pattern"""
        pattern = r'^[\w\-]+$'
        return bool(re.match(pattern, username))

    @staticmethod
    def _process_response(data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and structure essential profile data"""
        if not data.get('profile'):
            return {"error": "No profile data found"}

        profile = data['profile']

        # Extract only essential profile data
        processed_data = {
            "basic_info": {
                "full_name": profile.get('full_name'),
                "headline": profile.get('headline'),
                "location": {
                    "city": profile.get('city'),
                    "state": profile.get('state'),
                    "country": profile.get('country')
                },
                "summary": profile.get('summary'),
                "profile_url": f"https://linkedin.com/in/{profile.get('public_identifier')}",
                "connections": profile.get('connections')
            },
            "experience": [
                {
                    "title": exp.get('title'),
                    "company": exp.get('company'),
                    "location": exp.get('location'),
                    "description": exp.get('description'),
                    "duration": {
                        "start": {
                            "month": exp.get('starts_at', {}).get('month'),
                            "year": exp.get('starts_at', {}).get('year')
                        },
                        "end": {
                            "month": exp.get('ends_at', {}).get('month'),
                            "year": exp.get('ends_at', {}).get('year')
                        } if exp.get('ends_at') else None
                    }
                }
                for exp in profile.get('experiences', [])
            ],
            "education": [
                {
                    "school": edu.get('school'),
                    "degree": edu.get('degree_name'),
                    "field": edu.get('field_of_study'),
                    "duration": {
                        "start": {
                            "year": edu.get('starts_at', {}).get('year') if edu.get('starts_at') else None
                        },
                        "end": {
                            "year": edu.get('ends_at', {}).get('year') if edu.get('ends_at') else None
                        } if edu.get('ends_at') else None
                    }
                }
                for edu in profile.get('education', [])
            ]
        }

        return processed_data

    async def fetch_profile_async(self, username: str) -> Dict[str, Any]:
        """Fetch LinkedIn profile data asynchronously"""
        if not self._validate_linkedin_username(username):
            raise ValueError(f"Invalid LinkedIn username: '{username}'")

        payload = {
            "action": "wrapped",
            "cache": False,
            "email": "mail@example.com",
            "linkedinUrl": f"https://linkedin.com/in/{username}",
            "user": False
        }

        async with httpx.AsyncClient(timeout=self.TIMEOUT_SETTINGS) as client:
            try:
                response = await client.post(
                    self.BASE_URL,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()['data']

                return self._process_response(data)

            except httpx.TimeoutException:
                return {
                    "error": "Request timed out. The server took too long to respond.",
                    "error_type": "timeout"
                }
            except httpx.HTTPError as e:
                return {
                    "error": f"HTTP Error: {e.__class__.__name__} - {str(e)}",
                    "error_type": "http"
                }
            except Exception as e:
                return {
                    "error": f"An unexpected error occurred: {str(e)}",
                    "error_type": "unknown"
                }

    def fetch_profile(self, username: str) -> Dict[str, Any]:
        """Fetch LinkedIn profile data synchronously"""
        if not self._validate_linkedin_username(username):
            raise ValueError(f"Invalid LinkedIn username: '{username}'")

        payload = {
            "action": "wrapped",
            "cache": False,
            "email": "mail@example.com",
            "linkedinUrl": f"https://linkedin.com/in/{username}",
            "user": False
        }

        try:
            with httpx.Client(timeout=self.TIMEOUT_SETTINGS) as client:
                response = client.post(
                    self.BASE_URL,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()['data']

                return self._process_response(data)

        except httpx.TimeoutException:
            return {
                "error": "Request timed out. The server took too long to respond.",
                "error_type": "timeout"
            }
        except httpx.HTTPError as e:
            return {
                "error": f"HTTP Error: {e.__class__.__name__} - {str(e)}",
                "error_type": "http"
            }
        except Exception as e:
                return {
                    "error": f"An unexpected error occurred: {str(e)}",
                    "error_type": "unknown"
                }