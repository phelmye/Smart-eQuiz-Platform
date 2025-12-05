#!/usr/bin/env pwsh
# Test script for API endpoints

Write-Host "Testing Smart eQuiz API Endpoints" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Test Login
Write-Host "1. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@demo.local"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.accessToken
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }
Write-Host ""

# 2. Test Categories
Write-Host "2. Testing Categories..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "http://localhost:3000/api/questions/categories" -Method GET -Headers $headers
    Write-Host "✓ Found $($categories.Count) categories" -ForegroundColor Green
    $categories | Select-Object -First 3 | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed to fetch categories: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Test Questions
Write-Host "3. Testing Questions..." -ForegroundColor Yellow
try {
    $questions = Invoke-RestMethod -Uri "http://localhost:3000/api/questions" -Method GET -Headers $headers
    Write-Host "✓ Found $($questions.Count) questions" -ForegroundColor Green
    $questions | Select-Object -First 2 | ForEach-Object { 
        Write-Host "  - $($_.prompt) [Difficulty: $($_.difficulty)]" -ForegroundColor Gray 
    }
} catch {
    Write-Host "✗ Failed to fetch questions: $_" -ForegroundColor Red
}
Write-Host ""

# 4. Test Tournaments
Write-Host "4. Testing Tournaments..." -ForegroundColor Yellow
try {
    $tournaments = Invoke-RestMethod -Uri "http://localhost:3000/api/tournaments" -Method GET -Headers $headers
    Write-Host "✓ Found $($tournaments.Count) tournaments" -ForegroundColor Green
    $tournaments | ForEach-Object { 
        Write-Host "  - $($_.name) [$($_.status)]" -ForegroundColor Gray 
        Write-Host "    Questions: $($_._count.questions), Entries: $($_._count.entries)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "✗ Failed to fetch tournaments: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Test Practice - Start Session
Write-Host "5. Testing Practice - Start Session..." -ForegroundColor Yellow
try {
    $categoryId = $categories[0].id
    $practiceStart = @{
        categoryId = $categoryId
    } | ConvertTo-Json
    
    $session = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/start" -Method POST -Body $practiceStart -Headers $headers -ContentType "application/json"
    Write-Host "✓ Practice session started" -ForegroundColor Green
    Write-Host "  Category: $($categories[0].name)" -ForegroundColor Gray
    Write-Host "  Current Level: $($session.progress.currentLevel), XP: $($session.progress.totalXp)" -ForegroundColor Gray
    Write-Host "  Questions: $($session.questions.Count)" -ForegroundColor Gray
    
    $progressId = $session.progress.id
    $firstQuestion = $session.questions[0]
} catch {
    Write-Host "✗ Failed to start practice: $_" -ForegroundColor Red
}
Write-Host ""

# 6. Test Practice - Answer Question (Correct)
Write-Host "6. Testing Practice - Answer Question (Correct)..." -ForegroundColor Yellow
try {
    $answerBody = @{
        progressId = $progressId
        answer = @{
            questionId = $firstQuestion.id
            selectedOption = $firstQuestion.correctOption
            isCorrect = $true
            timeSpent = 5
        }
    } | ConvertTo-Json -Depth 3
    
    $answerResult = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/answer" -Method POST -Body $answerBody -Headers $headers -ContentType "application/json"
    Write-Host "✓ Answer submitted" -ForegroundColor Green
    Write-Host "  Correct: $($answerResult.correct)" -ForegroundColor Gray
    Write-Host "  XP Earned: $($answerResult.xpEarned)" -ForegroundColor Gray
    Write-Host "  New Streak: $($answerResult.newStreak)" -ForegroundColor Gray
    if ($answerResult.leveledUp) {
        Write-Host "  🎉 LEVELED UP!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to submit answer: $_" -ForegroundColor Red
}
Write-Host ""

# 7. Test Practice - Stats
Write-Host "7. Testing Practice - Stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/stats?categoryId=$categoryId" -Method GET -Headers $headers
    Write-Host "✓ Practice stats retrieved" -ForegroundColor Green
    Write-Host "  Level: $($stats.currentLevel), XP: $($stats.totalXp)" -ForegroundColor Gray
    Write-Host "  Questions Answered: $($stats.totalQuestionsAnswered)" -ForegroundColor Gray
    Write-Host "  Accuracy: $($stats.accuracy)%" -ForegroundColor Gray
    Write-Host "  Current Streak: $($stats.currentStreak)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch stats: $_" -ForegroundColor Red
}
Write-Host ""

# 8. Test Practice - Leaderboard
Write-Host "8. Testing Practice - Leaderboard..." -ForegroundColor Yellow
try {
    $leaderboard = Invoke-RestMethod -Uri "http://localhost:3000/api/practice/leaderboard?limit=5" -Method GET -Headers $headers
    Write-Host "✓ Leaderboard retrieved ($($leaderboard.Count) players)" -ForegroundColor Green
    $leaderboard | ForEach-Object {
        Write-Host "  $($_.rank). $($_.username) - Level $($_.level) ($($_.totalXp) XP)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to fetch leaderboard: $_" -ForegroundColor Red
}
Write-Host ""

# 9. Test Matches - Create Match
Write-Host "9. Testing Matches - Create Match..." -ForegroundColor Yellow
try {
    $tournamentId = $tournaments[0].id
    $createMatch = @{
        tournamentId = $tournamentId
        roundNumber = 1
    } | ConvertTo-Json
    
    $match = Invoke-RestMethod -Uri "http://localhost:3000/api/matches" -Method POST -Body $createMatch -Headers $headers -ContentType "application/json"
    Write-Host "✓ Match created" -ForegroundColor Green
    Write-Host "  Tournament: $($match.tournament.name)" -ForegroundColor Gray
    Write-Host "  Round: $($match.roundNumber), Status: $($match.status)" -ForegroundColor Gray
    
    $matchId = $match.id
} catch {
    Write-Host "✗ Failed to create match: $_" -ForegroundColor Red
}
Write-Host ""

# 10. Test Matches - Join Match
Write-Host "10. Testing Matches - Join Match..." -ForegroundColor Yellow
try {
    $joinMatch = @{
        matchId = $matchId
    } | ConvertTo-Json
    
    $participant = Invoke-RestMethod -Uri "http://localhost:3000/api/matches/join" -Method POST -Body $joinMatch -Headers $headers -ContentType "application/json"
    Write-Host "✓ Joined match" -ForegroundColor Green
    Write-Host "  Player: $($participant.user.username)" -ForegroundColor Gray
    Write-Host "  Score: $($participant.score)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to join match: $_" -ForegroundColor Red
}
Write-Host ""

# 11. Test Matches - Record Score
Write-Host "11. Testing Matches - Record Score..." -ForegroundColor Yellow
try {
    $recordScore = @{
        matchId = $matchId
        score = 150
        answersCorrect = 8
        answersWrong = 2
        totalTimeTaken = 180
    } | ConvertTo-Json
    
    $scoreResult = Invoke-RestMethod -Uri "http://localhost:3000/api/matches/score" -Method POST -Body $recordScore -Headers $headers -ContentType "application/json"
    Write-Host "✓ Score recorded" -ForegroundColor Green
    Write-Host "  Score: $($scoreResult.score)" -ForegroundColor Gray
    Write-Host "  Correct: $($scoreResult.answersCorrect), Wrong: $($scoreResult.answersWrong)" -ForegroundColor Gray
    Write-Host "  Rank: $($scoreResult.rank)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to record score: $_" -ForegroundColor Red
}
Write-Host ""

# 12. Test Matches - Get Match Details
Write-Host "12. Testing Matches - Get Match Details..." -ForegroundColor Yellow
try {
    $matchDetails = Invoke-RestMethod -Uri "http://localhost:3000/api/matches/$matchId" -Method GET -Headers $headers
    Write-Host "✓ Match details retrieved" -ForegroundColor Green
    Write-Host "  Status: $($matchDetails.status)" -ForegroundColor Gray
    Write-Host "  Participants: $($matchDetails.participants.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch match details: $_" -ForegroundColor Red
}
Write-Host ""

# 13. Test Matches - Tournament Leaderboard
Write-Host "13. Testing Matches - Tournament Leaderboard..." -ForegroundColor Yellow
try {
    $matchLeaderboard = Invoke-RestMethod -Uri "http://localhost:3000/api/matches/leaderboard/$tournamentId" -Method GET -Headers $headers
    Write-Host "✓ Tournament leaderboard retrieved ($($matchLeaderboard.Count) players)" -ForegroundColor Green
    $matchLeaderboard | Select-Object -First 3 | ForEach-Object {
        Write-Host "  $($_.rank). $($_.username) - $($_.totalScore) pts ($($_.wins) wins)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to fetch tournament leaderboard: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "API Test Complete!" -ForegroundColor Cyan
