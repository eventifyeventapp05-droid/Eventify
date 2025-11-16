## 📚 Eventify Backend

A Node.js RESTful API for managing an event management platform with multi-role access (Super Admin, Organizers, and Attendees). Built with scalability and security in mind to handle event creation, ticketing, scheduling, promotions, and attendee engagement.

## 🚀 Features

## Super Admin Module

- Admin can control updates and manage users.
- Provides notification about the current events held in the city or out of the city.These events
  include(concerts,seminars live shows,theater and cultural, events).
- Creating,editing,deleting events.
- Configuring Registration process and ticket sales and pricing.
- Uploading and managing event content(e.g images,schedules)

## Event Organizer Module

- Organizer organize the event booked by the Attendee.
- Provide services about the event
- Update the availability status to manage the multiple users.
- Scheduled the event according to the Attendee’s requirements.
- Make payments according to the budget created for an event

## User/Attendee Module

- Attendee or user can book the events on the app according to the plan.
- Book venue,catering,decor,vidoegraphy,photography and other activities and also pay the
  amount.
- User can view and search the social event that are being organized in the city or out of city.
- A user can easily communicate with the organizer

## 🛠️ Tech Stack

- Node.js - Runtime environment
- Express.js - Web framework
- MongoDB - Database
- JWT - Authentication
- dotenv - Environment variables
- Cloudinary - Image management
- Nodemailer - Email notifications
- Cron - Scheduled tasks

## 📁 Project Structure

📦eventify-backend
┣ 📂controllers
┃ ┣ 📂chat-controller
┃ ┃ ┗ 📜chat.controller.js
┃ ┣ 📂event-controller
┃ ┃ ┗ 📜event.controller.js
┃ ┣ 📂organizer-controller
┃ ┃ ┗ 📜organizer.controller.js
┃ ┣ 📂super-admin-controller
┃ ┃ ┗ 📜super-admin.controller.js
┃ ┣ 📂ticket-controller
┃ ┃ ┗ 📜ticket.controller.js
┃ ┗ 📂user-controller
┃ ┃ ┗ 📜user.controller.js
┣ 📂helpers
┃ ┣ 📂email-helper
┃ ┃ ┗ 📜email.helper.js
┃ ┣ 📂password-helper
┃ ┃ ┗ 📜password.helper.js
┃ ┗ 📂token-helper
┃ ┃ ┗ 📜token.helper.js
┣ 📂middlewares
┃ ┣ 📂auth-middleware
┃ ┃ ┗ 📜auth.middleware.js
┃ ┗ 📂security-middleware
┃ ┃ ┗ 📜security.middleware.js
┣ 📂models
┃ ┣ 📂chat-model
┃ ┃ ┗ 📜chat.model.js
┃ ┣ 📂event-model
┃ ┃ ┗ 📜event.model.js
┃ ┣ 📂organizer-model
┃ ┃ ┗ 📜organizer.model.js
┃ ┣ 📂super-admin-model
┃ ┃ ┗ 📜super-admin.model.js
┃ ┣ 📂ticket-model
┃ ┃ ┗ 📜ticket.model.js
┃ ┗ 📂user-model
┃ ┃ ┗ 📜user.model.js
┣ 📂routes
┃ ┣ 📂event-route
┃ ┃ ┗ 📜event.route.js
┃ ┣ 📂organizer-route
┃ ┃ ┗ 📜organizer.route.js
┃ ┣ 📂super-admin-route
┃ ┃ ┗ 📜super-admin.route.js
┃ ┣ 📂ticket-route
┃ ┃ ┗ 📜ticket.route.js
┃ ┗ 📂user-route
┃ ┃ ┗ 📜user.route.js
┣ 📂utilities
┃ ┣ 📂cloudinary-utility
┃ ┃ ┗ 📜cloudinary.utility.js
┃ ┗ 📂socket-utility
┃ ┃ ┣ 📜socket.manager.utility.js
┃ ┃ ┗ 📜socket.utility.js
┣ 📜.env
┣ 📜.gitignore
┣ 📜app.js
┣ 📜package-lock.json
┣ 📜package.json
┣ 📜Readme.md
┗ 📜vercel.json

## 📬 Contact

For any questions, suggestions, or contributions:

- Name: Muhammad Zain-Ul-Abideen
- Email: muhammadzainulabideen292@gmail.com
- GitHub: https://github.com/zain100000
- LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/
