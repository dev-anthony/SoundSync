// import { db } from "../db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const registerUser = (req, res) => {
//   const { username, email, password } = req.body;
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   const userexist = "SELECT * FROM users WHERE email = ?";
//   db.query(userexist, [email], (err, result) =>{
//     if(err) return res.status(500).json({error: err});
//     if (result.length > 0){
//       return res.status(401).json({error: 'User already exists, Login please.'})
//     }else{
//       const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
//       db.query(query, [username, email, hashedPassword], (err) => {
//       if (err) return res.status(500).json({ error: err });
//       res.json({ success: true, message: "User registered successfully!" });
//       });
//     }
//   })
// };

// export const loginUser = (req, res) => {
//   const { email, password } = req.body;

//   const query = "SELECT * FROM users WHERE email = ?";
//   db.query(query, [email], (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     if (result.length === 0) return res.status(404).json({ error: "User not found" });

//     const user = result[0];
//     const valid = bcrypt.compareSync(password, user.password);

//     if (!valid) return res.status(401).json({ error: "Invalid password" });

//     const token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ success: true, token });
//   });
// };
