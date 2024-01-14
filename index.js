const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//New imports

const cors = require("cors");
const httpServer = require("http").createServer(app); // Import and create an HTTP server
const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from this origin
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
  },
});

const uri =
  "mongodb+srv://radiationcorporation2:DD6OVn277Mm9KvLj@cluster0.no7secj.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.use(cors());
app.use(express.json());

// io.on("connection", (socket) => {
//   socket.on("message", (data) => {
//     console.log(data);
//   });
// });

async function run() {
  try {
    const ticketCollection = client.db("TicketBooking").collection("Ticket");
    const managerCollection = client.db("TicketBooking").collection("trip");
    const driverCollection = client.db("TicketBooking").collection("trip");
    const userCollection = client.db("TicketBooking").collection("users");
    const adminCollection = client.db("TicketBooking").collection("admin");
    const messageCollection = client.db("TicketBooking").collection("message");
    const claimCollection = client.db("TicketBooking").collection("claims");
    const walletCollection = client
      .db("TicketBooking")
      .collection("walletUsers");
    io.on("connection", (socket) => {
      // Listen for incoming messages from a client
      socket.on("message", async (data) => {
        try {
          // Save the message to MongoDB
          await messageCollection.insertOne({
            text: data.text,
            sender: data.sender,
          });

          // Emit the received message to all connected clients, including the sender
          io.emit("message", { text: data.text, sender: data.sender });
        } catch (error) {
          console.error("Error while processing message:", error);
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });

    // io.on("connection", (socket) => {
    //   socket.on("message", async (data) => {
    //     try {
    //       // Save the message to MongoDB
    //       await messageCollection.insertOne({
    //         text: data.text,
    //         sender: data.sender,
    //       });

    //       // Broadcast the message to all connected clients
    //       io.emit("message", { text: data.text, sender: data.sender });
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   });

    //   socket.on("disconnect", () => {
    //     console.log("A user disconnected");
    //   });
    // });

    // get method for finding the specific ticket for the user
    app.get("/message", async (req, res) => {
      const query = {};
      const cursor = messageCollection.find(query);
      const message = await cursor.toArray();
      res.send(message);
    });

    // get method for finding the specific ticket for the user
    app.get("/ticket", async (req, res) => {
      const query = {};
      const cursor = ticketCollection.find(query);
      const ticket = await cursor.toArray();
      res.send(ticket);
    });

    // find details with id information
    app.get("/ticket/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ticketCollection.findOne(query);
      console.log(result);
      res.send(result);
    });
    // post for add confirm ticket
    app.post("/addTicket", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await ticketCollection.insertOne(review);

      res.send(result);
    });

    app.get("/claims", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = claimCollection.find(query);
      const ticket = await cursor.toArray();
      res.send(ticket);
    });

    app.post("/addClaim", async (req, res) => {
      const claims = req.body;

      const result = await claimCollection.insertOne(claims);

      res.send(result);
    });

    app.post("/addMessage", async (req, res) => {
      const review = req.body;
      const result = await messageCollection.insertOne(review);

      res.send(result);
    });

    app.get("/validateUserRole", async (req, res) => {
      const userEmail = req.query.email;

      try {
        // Find the user by email in your MongoDB user collection
        const user = await userCollection.findOne({ email: userEmail });

        if (user) {
          res.json({ userRole: user.userRole });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    });
    app.get("/validateAdminRole", async (req, res) => {
      const userEmail = req.query.email;

      try {
        // Find the user by email in your MongoDB user collection
        const user = await adminCollection.findOne({ email: userEmail });

        if (user) {
          res.json({ userRole: user.userRole });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // find ticket email query
    app.get("/myTicket", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ticketCollection.find(query);
      const ticket = await cursor.toArray();
      res.send(ticket);
    });
    // find trip email query
    app.get("/myTrip", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = driverCollection.find(query);
      const ticket = await cursor.toArray();
      res.send(ticket);
    });
    // find ticket bus query
    app.get("/busTicket", async (req, res) => {
      const busNo = parseInt(req.query.busNo);

      const query = { busNo: busNo };
      const cursor = ticketCollection.find(query);
      const ticket = await cursor.toArray();
      res.send(ticket);
    });
    // get method for find all drivers
    app.get("/drivers", async (req, res) => {
      const query = {};
      const product = await userCollection.find(query).toArray();
      res.send(product);
    });
    // get method for users with email
    app.get("/singleDrivers", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    // get method for users with role query
    app.get("/drivers", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    // post for users method
    app.post("/drivers", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // post for wallet users method
    app.post("/addUsers", async (req, res) => {
      const user = req.body;
      const result = await walletCollection.insertOne(user);
      res.send(result);
    });
    app.post("/admin", async (req, res) => {
      const user = req.body;
      const result = await adminCollection.insertOne(user);
      res.send(result);
    });

    app.put("/claim/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateUser.status,
        },
      };
      const result = await claimCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/myticket/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateUser.status,
          secret: updateUser.secret,
        },
      };
      const result = await ticketCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    app.put("/adminApprove/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateUser.status,
        },
      };
      const result = await managerCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //  manager part
    // post for add confirm trip
    app.post("/addTrip", async (req, res) => {
      const review = req.body;
      const result = await managerCollection.insertOne(review);

      res.send(result);
    });
    // all the trip
    app.get("/trips", async (req, res) => {
      const query = {};
      const product = await managerCollection.find(query).toArray();
      res.send(product);
    });
    app.put("/addSeen/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateUser.status,
        },
      };
      const result = await messageCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // wallet section
    app.put("/addBalance", async (req, res) => {
      const { email, balance } = req.body;

      try {
        // Find the user with the provided email
        const userCursor = walletCollection.find({ email: email });

        // Convert the cursor to an array of documents
        const users = await userCursor.toArray();

        if (users.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        // Assume that there is only one user with the given email
        const user = users[0];

        // Calculate the new balance by adding the new balance to the existing balance
        const newBalance = parseInt(user.balance) + parseInt(balance);

        // Update the user's balance
        await walletCollection.updateOne(
          { email: email },
          { $set: { balance: newBalance } }
        );

        res
          .status(200)
          .json({ success: true, message: "Balance updated successfully" });
      } catch (error) {
        console.error("Error:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Nirapode is running");
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
