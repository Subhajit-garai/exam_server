import axios from "axios";

const API_URL = "http://localhost:3000/api/v1";
let token = "";

async function login() {
    try {
        const response = await axios.post(`${API_URL}/user/signin`, {
            email: "test@example.com", // Ensure this user exists or create one
            password: "password123"
        });
        // Assuming the token is set in a cookie or returned. 
        // If returned in body (which is not standard for this app based on controller), we'd use it.
        // But the controller sets a cookie. For this script, we might need to simulate a user or just use a known token if possible.
        // Actually, the signin controller sets a cookie. Axios doesn't automatically handle cookies across requests unless configured.
        // Let's assume we can get the token from the response if it was sent, or we might need to adjust the script to handle cookies.
        // Looking at user.controller.ts, signin doesn't return the token in the body, it sets a cookie.
        // For manual verification scripts, it's often easier to just assume a token is available or use a hardcoded one if we can't easily get it.
        // However, let's try to grab the cookie from the 'set-cookie' header.

        const cookies = response.headers['set-cookie'];
        if (cookies) {
            token = cookies[0].split(';')[0]; // Extract the token part
            console.log("Logged in, token cookie:", token);
        } else {
            console.log("Login successful but no cookie found. Check controller.");
        }
    } catch (error: any) {
        console.error("Login failed:", error.response?.data || error.message);
    }
}

async function updateSocialLinks() {
    try {
        const response = await axios.put(
            `${API_URL}/profile/social/update`,
            {
                linkedin: "https://linkedin.com/in/testuser",
                github: "https://github.com/testuser",
                telegram: "testuser_tg"
            },
            {
                headers: {
                    Cookie: token // Send the cookie back
                }
            }
        );
        console.log("Update Social Links Response:", response.data);
    } catch (error: any) {
        console.error("Update Social Links Failed:", error.response?.data || error.message);
    }
}

async function getProfile() {
    try {
        const response = await axios.get(
            `${API_URL}/profile`,
            {
                headers: {
                    Cookie: token
                }
            }
        );
        console.log("Get Profile Response:", response.data);
    } catch (error: any) {
        console.error("Get Profile Failed:", error.response?.data || error.message);
    }
}

async function main() {
    await login();
    if (token) {
        await updateSocialLinks();
        await getProfile();
    }
}

main();
