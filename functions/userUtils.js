function findUser(arrayOfArrays, enteredUsername, enteredPassword) {
 for (const userArray of arrayOfArrays) {
   const [username, password, role, cod] = userArray;
   if (username === enteredUsername && password === enteredPassword) {
     return {
       Username: username,
       Password: password,
       Role: role,
       Cod: cod || null, // If cod doesn't exist, set it to null in the object
     };
   }
 }

 return "User not found.";
}

module.exports = {
 findUser,
};