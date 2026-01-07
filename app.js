const { log } = require('console');
const express = require('express');
const app = express();
const port = 3001; // or any other port number you prefer

//this is changes

app.use(express.json());

const users = [ 
    {id:1,name:"A",email:"a@g.com",password:123},
    {id:2,name:"AB",email:"b@g.com",password:123},
    {id:3,name:"C",email:"c@g.com",password:123},
]

function handleUserNotFound(res, userId) {
    const userIndex = users.findIndex(u => u.id == userId);
    if (userIndex === -1) {
        // Send a 404 Not Found response and return true to signal calling function to stop
        res.status(404).send({ description: 'User not found.' });
        return true; 
    }
    // Return false if user was found
    return userIndex;
}

// function for email

function validateEmailUniqueness(email, res, currentUserId = null) {
    if (!email) {
        return false; // Email wasn't provided, so no conflict check needed.
    }
    const emailExists = users.some(u => {
      // const userIndex = users.findIndex(u => u.id === userId);
      if (currentUserId && u.id == currentUserId) {
            return false;
        }
        return u.email === email;
    });
     if (emailExists) {
        log(`Attempted to use existing email: ${email}`);

        res.status(409).send({ description: `The email address "${email}" already exists.` });
        return true; // Conflict found
    }

    return false; // No conflict found
}


app.get('/api/users/list', (req, res) => {

    res.status(200).json(users);
  });

//get a new item by id


app.get('/api/users/:id', (req, res) => {
  // const {id}= req?.params
  // const user = users?.find(d => id == d?.id)
  // if(!user){
  //   res.status(404).send({description:"No data found"})
  // }
  //   res.status(200).send(user)

   const userIndexOrTrue = handleUserNotFound(res, req?.params?.id); 
    // if (userIndexOrTrue === true) {
    //     return;
    // }
     const user = users[userIndexOrTrue];
    res.status(200).send(user);

});

// POST a new item

app.post('/api/users/add', (req, res) => {
  const {name, email, password} = req.body; 
  if (!name || !email || !password) {
        return res.status(400).send({ description: 'Invalid user data provided.' });
    }
    validateEmailUniqueness(email,res)
  //  const emailExists = users.some(u => u.email === email);

  // if (emailExists) {
  //     log(`Attempted to add existing email: ${email}`);
  //     // Use a 409 Conflict status code for duplicate entries
  //     return res.status(409).send({ description: `The email address "${email}" already exists.` });
  // }
  const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newData={id,name,email,password}
   users.push(newData);
   res.status(201).send(users);

  
});

  
//delete data

app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = handleUserNotFound(res, userId);
  // const userIndex = users.findIndex(u => u.id === userId);

  //  if (handleUserNotFound(res, userId)) {
  //       return; // Stop execution if user was not found
  //   }
    
    users.splice(userIndex, 1);

  // if (userIndex === -1) {
  //       return res.status(404).send({ description: 'User not found.' });
  //   }
  //   const deletedUser = users.splice(userIndex, 1);

    res.status(200).send({ description: 'User deleted successfully.'});
});


//put data

app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    // const userIndex = handleUserNotFound(res, userId);
     const result = handleUserNotFound(res, userId);
    // const userIndex = users.findIndex(u => u.id === userId);
    // const updates = req.body; // Data sent in the request body (e.g., { name: "New Name" })

   if (result === true) {
        return; 
    }
    
    const userIndex = result; // result now safely contains the index
    const updates = req.body; 

    
    // 2. Validate input (optional, but recommended)
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).send({ description: 'No update data provided.' });
    }
     const { email} = req?.body;
     if (validateEmailUniqueness(email, res, userId)) {
         return; // Stop execution if email conflicts
    }

    
//     const { email} = req?.body;
//     if(email){
//   //  const emailExists = users.some(u =>  u.email === email);
//    const emailExists = users.some(u => u.id != userId && u.email === email);

//   if (emailExists) {
//       log(`Attempted to add existing email: ${email}`);
//       // Use a 409 Conflict status code for duplicate entries
//       return res.status(409).send({ description: `The email address "${email}" already exists.` });
//   }
// }

   
    users[userIndex] = { 
        ...users[userIndex], 
        ...updates 
    };

    // 4. Send back the updated user object
    res.status(200).send({ 
        description: 'User updated successfully.', 
        user: users[userIndex] 
    });
});



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});



