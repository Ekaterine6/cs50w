document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients = '', subject = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-em').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

  document.querySelector('#compose-body').focus();
}

// Send Mail: add JavaScript code to actually send the email.
function send_email(event) {
    // stopping the default behaviour of reloading the page after a submitted form
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // You’ll likely want to make a POST request to /emails, 
    // passing in values for recipients, subject, and body.
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_mailbox('sent');
    });
}

// Mailbox: load the appropriate mailbox.
function load_mailbox(mailbox) {

  const view = document.querySelector('#emails-view');
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-em').style.display = 'none';

  // i had to clear old contect or otherwise i was getting emails all mixed up, some we duplicating...
  view.innerHTML = "";

  // Show the mailbox name
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Each email should then be rendered in its own box (e.g. as a <div> with a border) 
    // that displays who the email is from, what the subject line is, and the timestamp of the email.
    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = `card mb-3 ${email.read ? 'read' : 'unread'}`; // bootstrap card design
      element.style.cursor = "pointer";

      element.innerHTML = `
        <div class="card-body">
          <strong><h5 class="card-title">${email.sender}</h5></strong>
          <h6 class="card-subtitle mb-2 text-muted">Subject: ${email.subject}</h6>
          <p class="card-text">Date: ${email.timestamp}</p>
        </div>
      `;

      element.addEventListener('click', () => load_email(email.id, mailbox));
      view.append(element);
    });
  });
}

// View Email: When a user clicks on an email,the user should be taken 
// to a view where they see the content of that email.
function load_email(email_id, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-em').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const view = document.querySelector('#single-em');
    view.className = "card mb-3";

    let archivebtn = "";
    if (mailbox !== "sent") {
      archivebtn = `<button id="archive-btn" class="btn btn-primary">
      ${email.archived ? "Unarchive" : "Archive"}</button>
      `;
    }

    // doing almost the same thing i did in load_mailbox excpt adding body, archive and reply button.
    view.innerHTML = `
    <div class="card-body">
          <strong><h5 class="card-title">From: ${email.sender}</h5></strong>
          <h4 class="card-text">To: ${email.recipients}</h4>
          <h6 class="card-subtitle mb-2 text-muted">Subject: ${email.subject}</h6>
          <p class="card-text">Date: ${email.timestamp}</p>
          <h4 class="card-text">${email.body}</h4>
          ${archivebtn}
          <button id="reply-btn" class="btn btn-warning">Reply</button>
        </div>
      `;
    
      // Once the email has been clicked on, you should mark the email as read.
      if (!email.read) {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read:true })
        });
      }

      // Archive and Unarchive: Allow users to archive and unarchive emails that they have received.
      if (archivebtn !== "") {
        document.querySelector('#archive-btn').addEventListener('click', () => {

          // Recall that you can send a PUT request to /emails/<email_id> to mark an email as archived or unarchived.
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ archived: !email.archived })
          })
          .then(() => load_mailbox('inbox'));
        });
      }

      // Reply: Allow users to reply to an email.
      document.querySelector('#reply-btn').addEventListener('click', () => {
    // Pre-fill the composition form with the recipient field set to whoever sent the original email.
    const recipients = email.sender;
    // Pre-fill the subject line. If the original email had a subject line of foo, 
    let subject = email.subject;
    if (!subject.startsWith("Re:")) {
      subject = "Re: " + subject;
    }

    // Pre-fill the body of the email with a line like "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.
    // for now i just put "------ your reply:" to differentiate old message from the new which i knwo is not the best solution
    const body = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n------ your reply:\n`;
    compose_email(recipients, subject, body);
    });
  });
}
