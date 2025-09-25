## Another TODO App

[a3-ethanshanbaum.railway.internal](https://a3-ethanshanbaum-production.up.railway.app/)

This is a simple TODO app that allows users to keep track of tasks they need to accomplish. It allows the user to enter a title, description, and date of the task. It then stores these tasks in a MongoDB database, specific to each user. The application runs on an Express server which allows for GET, POST, DELETE, and PUT requests for TODO tasks. The main challenge I faced when developing the application was time management, as I had other priorities I had to focus on. For user authentication, I used OAuth since it could easily integrate with GitHub and had a large ammount of documentation through passport. The CSS framework I chose was Bootstrap, since it was a framework I was already familiar with. I added some of my own custom CSS, which included padding for table items and defining the font fo the application. For Express middleware packages, I used dotenv to store important information, mongodb for connecting to MongoDB, and passport in order to set up OAuth.

<img width="1070" height="512" alt="image" src="https://github.com/user-attachments/assets/ad0a0c33-59ed-4ecc-bc87-62dac175c051" />
<img width="733" height="366" alt="image" src="https://github.com/user-attachments/assets/6500fb87-6e51-4564-95ed-8d44cd4dfd47" />


## Technical Achievements
- **Tech Achievement 1**: I used OAuth authentication via the GitHub strategy to allow for user logins and creating accounts. This also nteracts with TODO data, since each item is attached to a specific user. This was challenging since I had never tried any type of authentication system, and I also ran into issues once I deployed my site. I believe I deserve 10 points for this.
- **Tech Achievement 2**: I hosted this site on Railway instead of Render. I found the process fairly seemless, however I had to make sure the build and install commands were correct, along with the environment variables. It did present some challenge as I had never used Railway before. I believe I deserve 5 points for this.

### Design/Evaluation Achievements
None
