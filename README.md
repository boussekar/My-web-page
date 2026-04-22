# AURUM — Luxury Hotel Booking Platform

> AI-matched luxury hotel booking. From boutique retreats to iconic grand hotels.

## Overview

AURUM is a full-stack luxury hotel booking platform featuring an AI-powered concierge that matches guests with curated properties worldwide. Built with PHP for the backend API and vanilla HTML/CSS/JS for the frontend.

## Features

- **AI Concierge** — Natural language hotel search powered by Groq API (Llama 3)
- **Smart Search** — Filter by destination, rooms, children, and budget
- **Hotel Gallery** — Full-screen image gallery with room and amenity views
- **Booking System** — Date-based reservation with payment flow
- **User Authentication** — JWT-based login/signup
- **Owner Dashboard** — Property management for hotel owners
- **Dark/Light Theme** — Toggle between dark and light modes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP 8+ |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| AI | Groq API (Llama 3 8B) |

## Project Structure

```
htdocs/
├── frontend/
│   ├── index.html          # Landing page + hotel search
│   ├── auth.html           # Login / Signup
│   ├── owner.html          # Owner registration
│   ├── owner-dashboard.html
│   ├── styles.css
│   ├── auth.css
│   ├── owner.css
│   ├── app.js              # Main application logic
│   ├── auth.js
│   └── owner.js
└── backend/
    ├── config/
    │   └── database.php    # MySQL connection
    ├── middleware/
    │   └── AuthMiddleware.php
    ├── utils/
    │   ├── JwtHelper.php
    │   └── Response.php
    └── api/
        ├── index.php       # API entry point
        ├── auth.php        # Authentication endpoints
        ├── hotels.php      # Hotel listing/search
        ├── bookings.php    # Booking management
        ├── ai-concierge.php # AI chat endpoint
        ├── analytics.php   # Usage analytics
        └── owner-properties.php
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth.php?action=register` | POST | User registration |
| `/api/auth.php?action=login` | POST | User login |
| `/api/hotels.php` | GET | List hotels (filter by city, price) |
| `/api/bookings.php` | POST | Create booking |
| `/api/ai-concierge.php` | POST | AI concierge chat |
| `/api/owner-properties.php` | GET/POST | Owner property management |

## Setup

1. **Database** — Create a MySQL database and import schema
2. **Configuration** — Update `backend/config/database.php` with your credentials
3. **Groq API** — Add your Groq API key in `backend/api/ai-concierge.php`
4. **Web Server** — Point your server to `htdocs/` as the document root
5. **JWT Secret** — Set a secure secret in `backend/utils/JwtHelper.php`

## Supported Destinations

Paris · Dubai · Algiers · Istanbul · Tokyo · Marrakech · Barcelona

## License

MIT
