const addBookButton = document.getElementById("add-book-button");
const blurOverlay = document.getElementById("blur-overlay");
const bookFormContainer = document.getElementById("book-form-container");
const db = firebase.firestore();

addBookButton.addEventListener("click", function() {
  showBookForm();
});

const bookForm = document.getElementById("book-form");
bookForm.addEventListener("submit", addBook);

function addBook(event) {
  event.preventDefault();

  // Get the values entered in the form
  const bookTitle = document.getElementById("book-title").value;
  const bookAuthor = document.getElementById("book-author").value;
  const bookPages = document.getElementById("book-pages").value;
  const bookRead = document.getElementById("book-read").checked;

  // Save the book to Firestore with the user ID
  const userId = firebase.auth().currentUser.uid;
  saveBookToFirestore(userId, bookTitle, bookAuthor, bookPages, bookRead);

  // Clear the form inputs
  bookForm.reset();

  // Hide the blur overlay and book form container
  hideBookForm();
}

function saveBookToFirestore(userId, bookTitle, bookAuthor, bookPages, bookRead) {
    db.collection("users")
      .doc(userId)
      .collection("books")
      .add({
        title: bookTitle,
        author: bookAuthor,
        pages: bookPages,
        read: bookRead,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Add "createdAt" field with current server timestamp
      })
      .then((docRef) => {
        console.log("Book saved to Firestore with ID:", docRef.id);
      })
      .catch((error) => {
        console.error("Error saving book to Firestore:", error);
      });
  }

function showBookForm() {
  blurOverlay.style.display = "block";
  bookFormContainer.style.display = "block";

  // Trigger reflow to ensure the initial state is applied
  bookFormContainer.offsetHeight;

  // Add the show class to trigger the pop-in effect
  bookFormContainer.classList.add("show");

  // Add a click event listener to the blur overlay
  blurOverlay.addEventListener("click", handleBlurOverlayClick);
}

function handleBlurOverlayClick(event) {
  if (event.target === blurOverlay) {
    hideBookForm();
  }
}

function hideBookForm() {
  // Remove the show class to trigger the pop-out effect
  bookFormContainer.classList.remove("show");

  // Remove the click event listener from the blur overlay
  blurOverlay.removeEventListener("click", handleBlurOverlayClick);

  // After the pop-out animation is complete, hide the form container and blur overlay
  setTimeout(function() {
    bookFormContainer.style.display = "none";
    blurOverlay.style.display = "none";
  }, 300); // Adjust the timeout value to match the CSS transition duration
}

// Add a listener to fetch the book cards from Firestore for the logged-in user
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      const userId = user.uid;
      db.collection("users")
        .doc(userId)
        .collection("books")
        .orderBy("createdAt", "desc") // Sort by "createdAt" field in descending order
        .onSnapshot((snapshot) => {
          const bookCardsContainer = document.getElementById("books");
          bookCardsContainer.innerHTML = ""; // Clear the existing book cards
  
          snapshot.forEach((doc) => {
            const bookData = doc.data();
            const bookCard = createBookCard(doc.id, bookData.title, bookData.author, bookData.pages, bookData.read, doc.ref);
            bookCardsContainer.appendChild(bookCard);
          });
        });
    }
  });

// Function to create a book card element
function createBookCard(docId, title, author, pages, read, docRef) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");
  
    const titleElement = document.createElement("h3");
    titleElement.textContent = `"` + title + `"`;
    bookCard.appendChild(titleElement);
  
    const authorElement = document.createElement("h3");
    authorElement.textContent = author;
    bookCard.appendChild(authorElement);
  
    const pagesElement = document.createElement("h3");
    pagesElement.textContent = `${pages} Pages`;
    bookCard.appendChild(pagesElement);
  
    // Create a div to group the input and label
    const checkboxDiv = document.createElement("div");
  
    // Add the checkbox for read/unread
    const readCheckbox = document.createElement("input");
    readCheckbox.type = "checkbox";
    readCheckbox.checked = read;
    readCheckbox.addEventListener("change", () => {
      updateBookReadStatus(docRef, readCheckbox.checked);
    });
    checkboxDiv.appendChild(readCheckbox);
  
    // Add the label for the checkbox
    const readLabel = document.createElement("label");
    readLabel.setAttribute("for", docId);
    readLabel.textContent = "Read";
    checkboxDiv.appendChild(readLabel);
  
    // Add the checkbox div to the book card
    bookCard.appendChild(checkboxDiv);
  
    // Add the "Remove" button
    function removeBook(docId) {
      const userId = firebase.auth().currentUser.uid;
      const docRef = db.collection("users").doc(userId).collection("books").doc(docId);
      removeBookFromFirestore(docRef);
    }
  
    // Add the "Remove" button
    const removeButton = document.createElement("button");
    removeButton.id = "remove";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      removeBook(docId);
    });
    bookCard.appendChild(removeButton);
  
    return bookCard;
  }
  function updateBookReadStatus(docRef, readStatus) {
    docRef.update({
        read: readStatus
      })
      .then(() => {
        console.log("Book read status updated successfully.");
        // Update the read label based on the new read status
        const readLabel = docRef.parentNode.querySelector("label[for=read]");
        readLabel.textContent = readStatus ? "Read" : "Unread";
      })
      .catch((error) => {
        console.error("Error updating book read status:", error);
      });
  }

function removeBookFromFirestore(docRef) {
  docRef.delete()
    .then(() => {
      console.log("Book removed from Firestore with ID:", docRef.id);
    })
    .catch((error) => {
      console.error("Error removing book from Firestore:", error);
    });
}





// Get a reference to the Firebase Authentication and Firestore services
const auth = firebase.auth();
const firestore = firebase.firestore();

// Add event listener to the sign-in button
const signInButton = document.getElementById("sign-in-button");
signInButton.addEventListener("click", signInWithGoogle);

// Sign in with Google
const signOutButton = document.getElementById("sign-out-button");
signOutButton.addEventListener("click", signOut);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log("Signed in successfully with user ID: ", user.uid);
    // Hide the sign-in button
    const signInButton = document.getElementById("sign-in-button");
    signInButton.style.display = "none";
    // Display the username
    const userDisplay = document.getElementById("user-display");
    const firstName = user.displayName.split(" ")[0];
    userDisplay.textContent = "Welcome Back " + firstName + "!";
    // Show the sign-out button
    signOutButton.style.display = "block";
  } else {
    // User is signed out
    console.log("User signed out");
    // Show the sign-in button
    const signInButton = document.getElementById("sign-in-button");
    signInButton.style.display = "block";
    // Hide the username and sign-out button
    const userDisplay = document.getElementById("user-display");
    userDisplay.textContent = "";
    signOutButton.style.display = "none";
  }
});

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Sign-in success, no additional handling needed here
    })
    .catch((error) => {
      console.error(error);
    });
}

function signOut() {
  firebase.auth().signOut()
    .then(() => {
      // Sign-out success, no additional handling needed here
    })
    .catch((error) => {
      console.error(error);
    });
}
// Add a click event listener to the sign-out button
signOutButton.addEventListener("click", function() {
    // Sign out the user
    firebase.auth().signOut().then(function() {
      // Refresh the page
      location.reload();
    }).catch(function(error) {
      console.error("Error signing out:", error);
    });
  });


