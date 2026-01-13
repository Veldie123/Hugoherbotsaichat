#!/bin/bash

# Debug signup route
echo "🧪 Testing signup route..."

curl -X POST \
  https://pckctmojjrrgzuufsqoo.supabase.co/functions/v1/make-server-b9a572ea/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBja2N0bW9qanJyZ3p1dWZzcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzODczMDksImV4cCI6MjA0Mzk2MzMwOX0.K1fqfQXbJU_xdjPgGNRaZ-Fvv7TkWz2ioukpDfZAzNg" \
  -d '{
    "email": "debug@hugoherbots.test",
    "password": "DebugPassword123!",
    "firstName": "Debug",
    "lastName": "User"
  }' \
  -v

echo "\n\n✅ Check Supabase Edge Function logs for detailed error"
