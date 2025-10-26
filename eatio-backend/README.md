# Zomato Clone

A full-stack food delivery application inspired by Zomato, built with React, Node.js, and Tailwind CSS.

## Features

*   **User Authentication:** Secure sign-up and login for users.
*   **Restaurant Discovery:** Browse and search for restaurants based on location and cuisine.
*   **Menu Viewing:** View detailed menus for each restaurant.
*   **Cart Management:** Add, remove, and update items in the shopping cart.
*   **Order Placement:** Place orders with selected items.
*   **Order Tracking:** View order history and status.
*   **Payment Integration:** (Placeholder for payment gateway integration details)
*   **Admin Panel:** Manage restaurants, users, orders, and other platform settings.

## Technologies Used

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (as suggested by `server/config/db.js`)
*   **Cloudinary:** For image storage (as suggested by `server/config/cloudinary.js`)

## Setup and Installation

### Prerequisites

*   Node.js and npm (or yarn) installed on your machine.
*   MongoDB installed and running, or a MongoDB Atlas account.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GitVipulSingh/eatio.git
    cd eatio
    ```

2.  **Set up the Server:**
    *   Navigate to the server directory:
        ```bash
        cd server
        ```
    *   Install server dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `server/` directory by copying `.env.example`:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file and configure all required environment variables. See `.env.example` for all required variables including:
        ```
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        SUPERADMIN_EMAIL=your_superadmin_email
        SUPERADMIN_PASSWORD=your_secure_password
        # ... and other required variables
        ```

3.  **Set up the Client:**
    *   Navigate to the client directory:
        ```bash
        cd ../client
        ```
    *   Install client dependencies:
        ```bash
        npm install
        ```
    *   (Optional) If there are client-specific environment variables, create a `.env` file in the `client/` directory.

4.  **Create Super Admin User:**
    *   After setting up the server environment variables, create the super admin user:
        ```bash
        cd server
        node scripts/create-superadmin.js
        ```
    *   This will create a super admin user with the credentials from your `.env` file.

5.  **Set up the Admin Panel:**
    *   Navigate to the admin directory:
        ```bash
        cd ../admin
        ```
    *   Install admin panel dependencies:
        ```bash
        npm install
        ```
    *   (Optional) If there are admin-specific environment variables, create a `.env` file in the `admin/` directory.

## Running the Application

1.  **Start the Server:**
    *   Navigate to the server directory:
        ```bash
        cd server
        ```
    *   Run the server:
        ```bash
        node server.js
        ```
    *   The server will typically run on `http://localhost:5000` (or as configured in your `.env` file).

2.  **Start the Client:**
    *   Navigate to the client directory:
        ```bash
        cd ../client
        ```
    *   Run the client development server:
        ```bash
        npm run dev
        ```
    *   The client will typically run on `http://localhost:5173` (or as configured in `client/vite.config.js`).

3.  **Start the Admin Panel:**
    *   Navigate to the admin directory:
        ```bash
        cd ../admin
        ```
    *   Run the admin panel development server:
        ```bash
        npm run dev
        ```
    *   The admin panel will typically run on `http://localhost:5174` (or as configured in `admin/vite.config.js`).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
