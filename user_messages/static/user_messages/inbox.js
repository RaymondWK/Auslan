// user_messages/static/user_messages/inbox.js
// Copyright © 2025 Dr. Raymond William Kennington Ph.D.

// Start with first post
let counter = 0;

// Load posts in groups
const quantity = 10;

let allLoaded = false;

globalMenuChoice = 'new';

// If scrolled to bottom, load the next 20 posts

function nearBottomOfPage() {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight
}

let loading = false;

const messagesView = document.getElementById('messages-view');

document.addEventListener('DOMContentLoaded', function() {

  messagesView.addEventListener('scroll', () => {
    if (   !allLoaded
        && !loading
        && messagesView.scrollTop + messagesView.clientHeight >= messagesView.scrollHeight - 10) {
      loading = true;
      load_messagebox(globalMenuChoice, true)
        .catch(err => console.error(err))
        .finally(() => loading = false);
    }
  });

  // Use buttons to toggle between views
  document.addEventListener("click", function(event) {
    const btn = event.target;

    if (!btn.classList.contains("messages-menu"))
      return;

    switch (btn.id) {
      case "new":
      case "inbox":
      case "sent":
      case "archived":
        load_messagebox(btn.id); // returns a Promise
        break;
      case "muted":
        load_muted_users();
        break;
      case "compose":
        compose_message();
        break;
    }
  });

  // When DOM loads, render the first set of posts

  // By default, load the globalMenuChoice
  load_messagebox(globalMenuChoice);
});

document.addEventListener('DOMContentLoaded', function() {
  const CURRENT_USER_USERNAME = document.body.dataset.currentUsername;

  const form          = document.querySelector('#compose-form');
  const submit        = document.querySelector('.submit');
  const newSender     = document.querySelector('#sender');
  const newRecipients = document.querySelector('#compose-recipients');
  const newSubject    = document.querySelector('#compose-subject');
  const newBody       = document.querySelector('#compose-body');

  const resultElement = document.querySelector('#result');
  const noteElement   = document.querySelector('#notification');

  function highlightMenuChoice(menuChoice) {
    menuList = ['new', 'inbox', 'compose', 'sent', 'archived', 'muted'];

    menuList.forEach(menu =>
      document.querySelector('#' + menu).classList.remove('active')
    );

    document.querySelector('#' + menuChoice).classList.add('active');
  }

  function showNotification(msg) {
    noteElement.innerText = msg;
    noteElement.style.display = "block";
    noteElement.style.opacity = "1";

    // Force reflow so animation can restart
    noteElement.style.animation = "none";
    noteElement.offsetHeight; // trigger reflow
    noteElement.style.animation = null;

    noteElement.style.animationPlayState = "running";
  }

  noteElement.addEventListener("animationend", () => {
    noteElement.style.display = "none"; // auto-hide when animation ends
  });

  form.addEventListener('submit', (event) => {
    // Disable the submit button to prevent clicking it twice for the same message
    if (submit) {
      submit.disabled = true;
    }

    event.preventDefault();  // stop actual form submission

    resultElement.innerHTML = '';

    const recipients = newRecipients.value;
    const subject    = newSubject.value;
    const body       = newBody.value;

    fetch('/user_messages/send/', {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json',
       'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({
        recipients: recipients,
        subject   : subject,
        body      : body
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.message) {
        showNotification("Message sent successfully!");

        // Clear out input fields
        newRecipients.value = '';
        newSubject.value    = '';
        newBody.value       = '';

        load_messagebox('sent');
      }
      else if (result.error) {
        resultElement.innerHTML = result.error;
      }
    })
    .finally(() => {
      // Enable the submit button
      if (submit) {
        submit.disabled = false;
      }
    });
  });

  // NB: This event listener is required because of a problem
  //     passing raw text from the 'body' that contained newlines.
  //     The reply button is added dynamically to a message,
  //     so the button does not exist after loading the DOM.
  //     Therefore the button must be searched for amongst all buttons.
  document.addEventListener("click", (e) => {
    target = e.target;

    if (target.classList.contains("reply-btn") || target.classList.contains("reply-all-btn")) {
      const sender     = target.dataset.sender;
      const recipients = target.dataset.recipients.split(",").map(r => r.trim());
      const subject    = target.dataset.subject;
      const timestamp  = target.dataset.timestamp;
      const body       = target.dataset.body;

      // replyTo is just the sender usually, but
      // replying to all requires the recipients to be added

      let replyTo = sender;

      if (target.classList.contains("reply-all-btn")) {
        const combined = [sender, ...recipients]; // All recipients, including the original sender

        const unique = combined.filter((addr, idx, arr) => arr.indexOf(addr) === idx); // Remove any duplicates

        // Include all message addresses unless the current user was the only original recipient;
        // i.e. all message addresses other than the current user, unless this set is empty - in which case
        // the current user is included
        const filtered = unique.filter((addr, _, arr) => {
          const withoutCurrentUsername = arr.filter(a => a !== CURRENT_USER_USERNAME);

          return addr !== CURRENT_USER_USERNAME || withoutCurrentUsername.length === 0;
        });

        replyTo = filtered.join(", ");
      }

      const datedBody = `On ${timestamp}, ${sender} wrote:\n\n${body}`;

      // Call the compose function
      compose_message(replyTo, subject.startsWith("Re:") ? subject : `Re: ${subject}`, datedBody);

    } else if (target.classList.contains("mute-btn") || target.classList.contains("unmute-btn")) {
      // This code will only execute if
      // (a)     the user is not muted,
      //     AND is on either the 'view message' page
      // OR
      // (b)     the user is muted,
      //     AND is on the 'muted' page

      // if case (a):
      //     The 'inbox' will be displayed
      // else case (b)
      //     The 'muted' page will be reloaded
      //     with the unmuted user no longer appearing

      const button = target;

      if (button.classList.contains("disabled"))
          return;

      button.classList.add("disabled");

      // Having a 'muted' button means the user was not muted
      // Having an 'unmute' button means the user was muted

      // Don't notify users that they've been muted

      const mutedUserId = target.dataset.userId;

      if (mutedUserId === currentUserId) {
        alert("You cannot 'mute' yourself.");
        button.classList.remove("disabled");
        return;
      }

      // List this sender as 'muted' (for the current user)
      let to_mute = target.classList.contains("mute-btn");
      const url   = `/user_messages/mute/${mutedUserId}/`;

      fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken" : getCookie("csrftoken")
        },
        body: JSON.stringify({
          to_mute: to_mute
        })
      })
      .then(async response => {
        if (response.status === 403) {
          const data = await response.json();
          alert(data.error || "Error: Might be no internet.");
          return null;
        }

        if (!response.ok)
          throw new Error("Mute request failed.");

        return response.json();
      })
      .then(data => {
        if (!data) // Exit if previous block handled it
          return;

        if (to_mute)
          load_messagebox("inbox"); // reload inbox after muting
        else
          load_muted_users();
      })
      .catch(err => console.error("Error:", err))
      .finally(() => {
        button.classList.remove("disabled"); // Undo disabling of the button
        button.blur(); // Remove keyboard focus
      });
    }
  });
});

function clearViews() {
  document.querySelector('#messages-view').innerHTML = "";
  document.querySelector('#message-view') .innerHTML = "";
  document.querySelector('#muted-view')   .innerHTML = "";
}

function highlightMenuChoice(menuChoice) {
  menuList = ['new', 'inbox', 'compose', 'sent', 'archived', 'muted'];

  menuList.forEach(menu =>
    document.querySelector('#' + menu).classList.remove('active')
  );

  document.querySelector('#' + menuChoice).classList.add('active');

  // Reset infinite scroll counter
  counter   = 0;
  allLoaded = false;

  // Set the current menu choice
  globalMenuChoice = menuChoice
}

function compose_message(to = '', subject = '', body_message = '') {
  const menuBtn = document.querySelector('#' + 'compose');

  if (menuBtn.classList.contains('disabled'))
    return;

  menuBtn.classList.add('disabled');

  try {
    highlightMenuChoice('compose');
    clearViews();

    // Show compose view and hide other views
    document.querySelector('#messages-view').style.display = 'none';
    document.querySelector('#message-view') .style.display = 'none';
    document.querySelector('#muted-view')   .style.display = 'none';
    document.querySelector('#compose-view') .style.display = 'block';

    const newRecipients = document.querySelector('#compose-recipients');
    const newSubject    = document.querySelector('#compose-subject');
    const newBody       = document.querySelector('#compose-body');

    // Set or clear out composition fields
    if (to !== '') {
      newRecipients.readOnly = true;
    } else {
      newRecipients.readOnly = false;
    }

    newRecipients.value = to;
    newSubject   .value = subject;
    newBody      .value = body_message;

    // Set focus to the first field that is editable
    if ((to !== '') && (subject !== '')) {
      // Move cursor to start of the second line
      const firstLineLength  = newBody.value.indexOf("\n") + 1; // position just after first newline
      newBody.selectionStart = newBody.selectionEnd = firstLineLength;
      newBody.focus();
    } else if ((to !== '') && (subject === '')) {
        newSubject.focus();
    } else if ((to === '') && (subject !== '')) {
        // Not possible
    } else {
        newRecipients.focus();
    }

    document.querySelector('#result').innerHTML = '';
  } finally {
    menuBtn.classList.remove('disabled');
  }
}

function archive(event, message_id, to_archive) { // 'to_archive' is true or false (to unarchive)
  event.stopPropagation(); // Prevent the click from bubbling up and opening the message as well

  fetch(`/user_messages/get_message/${message_id}/`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({
      archived: to_archive
    })
  })
  .then(() => {
    if (to_archive) {
      load_messagebox("inbox"); // reload inbox after archive completes
    } else {
      load_messagebox("archived"); // reload inbox after archive completes
    }
  });
};

function deleteMessage(event, messageId, messagebox) {
  // Prevent event bubbling (e.g. so a parent element doesn't trigger)
  event?.stopPropagation();

  // Confirm deletion (optional)
  if (!confirm("Are you sure you want to delete this message?")) {
    return;
  }

  fetch(`/user_messages/get_message/${encodeURIComponent(messageId)}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")  // Optional but safer if CSRF is enforced
    },
    body: JSON.stringify({ delete: true })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return response.json().catch(() => ({})); // In case the response isn't JSON
  })
  .then(() => {
    load_messagebox(messagebox);
  })
  .catch(error => {
    console.error("Error deleting message:", error);
    alert("Something went wrong while deleting the message.");
  });
}

function load_messagebox(messagebox, append=false) {
  const menuBtn = document.querySelector('#' + messagebox);

  if (menuBtn.classList.contains('disabled'))
    return Promise.resolve();

  menuBtn.classList.add('disabled');

  if (!append) {
    highlightMenuChoice(messagebox);
    clearViews();
  }

  // Show the messagebox and hide other views
  document.querySelector('#compose-view') .style.display = 'none';
  document.querySelector('#message-view') .style.display = 'none';
  document.querySelector('#muted-view')   .style.display = 'none';
  document.querySelector('#messages-view').style.display = 'block';

  // Show the messagebox name
  const messagesView = document.querySelector('#messages-view');

  if (!append) {
    // Clear and add the header only once
    messagesView.innerHTML = `<h5>${messagebox.charAt(0).toUpperCase() + messagebox.slice(1)}</h5>`;
    counter   = 0;
    allLoaded = false;
  }

  // Set start and end post numbers, and update counter
  const start = counter;

  const url = `/user_messages/get_messages/${messagebox}/?start=${start}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const messages = data.messages;

      if (messages.length === 0) {
        allLoaded = true;

        if (start === 0) {
          // No records

          if (messagebox === 'new') {
            messagesView.innerHTML += "<p id='no-messages-message'>No new messages since last login.</p>";
          } else {
            messagesView.innerHTML += "<p id='no-messages-message'>No messages found.</p>";
          }
        } else { // start > 0
          // End of scroll
          messagesView.innerHTML += "<p id='no-messages-message'>End of messages reached.</p>";
        }

        menuBtn.classList.remove('disabled');
        return Promise.resolve();;
      }

      // For each message, create a div
      messages.forEach(message => {
        const messageDiv = document.createElement('div');

        if (message.read === true) {
          messageDiv.className = 'messages-item messages-read';
        } else {
          messageDiv.className = 'messages-item messages-unread';
        }

        if ((messagebox === 'new') || (messagebox === 'inbox')) {
          messageDiv.innerHTML = `
            <span class="messages-address">${message.sender}</span>
            <span class="messages-subject">${message.subject}</span>
            <div class="right-controls">
              <span class="messages-date">${message.timestamp}</span>
              <button class="archive-btn" onclick="archive(event, ${message.id}, true)">Archive</button>
              <button class="delete-btn" title="Deletions are permanent and cannot be undone." onclick="deleteMessage(event, ${message.id}, 'inbox')">Del</button>
            </div>
          `;

        } else if (messagebox === 'sent') {
          messageDiv.innerHTML = `
            <span class="messages-address">${message.recipients}</span>
            <span class="messages-subject">${message.subject}</span>
            <div class="right-controls">
              <span class="messages-date sent-date">${message.timestamp}</span>
              <button class="delete-btn" onclick="deleteMessage(event, ${message.id}, 'sent')">Del</button>
            </div>
          `;
        } else { // 'archived'
          messageDiv.innerHTML = `
            <span class="messages-address">${message.sender}</span>
            <span class="messages-subject">${message.subject}</span>
            <div class="right-controls">
              <span class="messages-date">${message.timestamp}</span>
              <button class="archive-btn" onclick="archive(event, ${message.id}, false)">Unarc</button>
              <button class="delete-btn" onclick="deleteMessage(event, ${message.id}, 'archive')">Del</button>
            </div>
          `;
        }

        messagesView.appendChild(messageDiv);

        // Add a click handler to view the message's details
        messageDiv.addEventListener('click', () => load_message(message.id));
      });

      counter += messages.length;
    })
    .catch(err => console.error("Error:", err))
    .finally(() => {
      menuBtn.classList.remove('disabled');
    });
}

function prefixLines(text, prefix) {
  return text.replace(/^/gm, prefix);
}

function load_message(message_id) {
  clearViews();

  // Show the messagebox and hide other views
  document.querySelector('#messages-view').style.display = 'none';
  document.querySelector('#compose-view') .style.display = 'none';
  document.querySelector('#muted-view')   .style.display = 'none';
  document.querySelector('#message-view') .style.display = 'block';

  const messageView = document.querySelector('#message-view');
  messageView.innerHTML = '' // Clear previous message

  // Fetch the message for this message id
  fetch(`/user_messages/get_message/${message_id}/`)
    .then(response => response.json())
    .then(message => {
      if (message.error) {
        messageView.innerHTML += "<p id='no-message-message'>Message not found.</p>";
        return;
      }

      // create a div
      const messageDiv = document.createElement('div');

      if (message.read === true) {
        messageDiv.className = 'message-item message-read';
      } else {
        messageDiv.className = 'message-item message-unread';
      }

      var prefixedBody = prefixLines(message.body, '> ');

      // NB: Passing the body caused a syntax problem by converting
      //     newlines to become multi-line code.
      //     Therefore a technique using data-* from Lecture 5
      //     is now used. I had to re-read the notes from the lecture
      //     and research its use in the context here.

      if (message.is_muted) {
        messageDiv.innerHTML = `
          <span><strong>From:</strong> ${message.sender} ${message.is_muted ? '🔇' : ''}</span><br>
          <span><strong>To:</strong> ${message.recipients}</span><br>
          <span><strong>Subject:</strong> ${message.subject}</span><br>
          <span><strong>Timestamp:</strong> ${message.timestamp}</span><br>
          <br>
          <button class="btn btn-sm btn-outline-primary reply-btn"
            data-sender     = "${message.sender}"
            data-recipients = "${message.recipients}"
            data-subject    = "${message.subject}"
            data-timestamp  = "${message.timestamp}"
            data-body       = "${prefixedBody}">
            Reply
          </button>
          <button class="btn btn-sm btn-outline-primary reply-all-btn"
            data-sender     = "${message.sender}"
            data-recipients = "${message.recipients}"
            data-subject    = "${message.subject}"
            data-timestamp  = "${message.timestamp}"
            data-body       = "${prefixedBody}">
            Reply All
          </button>
          <br><br>
          ${message.body.replace(/\n/g, "<br>")}
        `;
      } else {
        messageDiv.innerHTML = `
          <span><strong>From:</strong> ${message.sender}</span><br>
          <span><strong>To:</strong> ${message.recipients}</span><br>
          <span><strong>Subject:</strong> ${message.subject}</span><br>
          <span><strong>Timestamp:</strong> ${message.timestamp}</span><br>
          <br>
          <button class="btn btn-sm btn-outline-primary reply-btn"
            data-sender     = "${message.sender}"
            data-recipients = "${message.recipients}"
            data-subject    = "${message.subject}"
            data-timestamp  = "${message.timestamp}"
            data-body       = "${prefixedBody}">
            Reply
          </button>
          <button class="btn btn-sm btn-outline-primary reply-all-btn"
            data-sender     = "${message.sender}"
            data-recipients = "${message.recipients}"
            data-subject    = "${message.subject}"
            data-timestamp  = "${message.timestamp}"
            data-body       = "${prefixedBody}">
            Reply All
          </button>
          <button class="btn btn-sm btn-outline-primary mute-btn"
            data-user-id  = "${message.sender_id}"
            data-is_muted = "${message.is_muted}">
            Mute
          </button>
          <br><br>
          ${message.body.replace(/\n/g, "<br>")}
        `;
      }

      messageView.appendChild(messageDiv);

      fetch(`/user_messages/get_message/${message_id}/`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
          read: true
        })
      })
  });
}

function load_muted_users() {  // for the current user
  const menuBtn = document.querySelector('#' + 'muted');

  if (menuBtn.classList.contains('disabled'))
    return;

  menuBtn.classList.add('disabled');

  highlightMenuChoice('muted');
  clearViews();

  document.querySelector('#messages-view').style.display = 'none';
  document.querySelector('#message-view') .style.display = 'none';
  document.querySelector('#compose-view') .style.display = 'none';
  document.querySelector('#muted-view')   .style.display = 'block';

  currentMenu = "muted";

  const mutedUsersView = document.getElementById('muted-view');
  mutedUsersView.innerHTML = "<h5>Muted Users</h5>"

  // Fetch muted users
  fetch(`/user_messages/get_muted_users/`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json()
  })
  .then(data => {
    const muted_users = data.muted_users;

    if (!muted_users || muted_users.length === 0) {
      mutedUsersView.innerHTML += "<p id='no-users-message'>No muted users.</p>";
      menuBtn.classList.remove('disabled');

      return;
    }

    // For each user, create a div
    muted_users.forEach(muted_user => {
      const userDiv = document.createElement('div');

      userDiv.className = "user-item"

      // Process the display of the 'unmute' button for this post
      let unmuteButtonHTML;

      unmuteButtonHTML = `<button class="unmute-btn"
                          data-user-id="${muted_user.id}">
                          Unmute
                          </button>
                         `;

      let actionButtonsHTML = "";

      actionButtonsHTML = `
        <span class="user-actions">
        ${unmuteButtonHTML ? `<span class="mute-row">${unmuteButtonHTML}</span>` : ""}
        </span>
        <br>
      `;

      userDiv.innerHTML = `
        <span class="muted-username">${muted_user.username}</span>
        ${actionButtonsHTML}
        <span class="muted-at-timestamp">Muted: ${muted_user.muted_at}</span><br>
      `;

      mutedUsersView.appendChild(userDiv);
    });
  })
  .catch(error => {
    console.error("Error fetching muted users:", error);
    mutedUsersView.innerHTML += `<p class="text-danger">Error loading muted users.</p>`;
  })
  .finally(() => {
    menuBtn.classList.remove('disabled');
  });
}
