const bcrypt = require("bcryptjs");

const hashPassword = async () => {
    const password = "Admin@1234"; // Change this to your preferred password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
};

hashPassword();
