document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
    // stopping the default behaviour of reloading the page after a submitted form
    event.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

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

      element.addEventListener('click', () => load_email(email.id));
      view.append(element);
    });
  });
}

function load_email(email_id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-em').style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const view = document.querySelector('#single-em');
    view.className = "card mb-3";

    view.innerHTML = `
    <div class="card-body">
          <strong><h5 class="card-title">From: ${email.sender}</h5></strong>
          <h4 class="card-text">To: ${email.recipients}</h4>
          <h6 class="card-subtitle mb-2 text-muted">Subject: ${email.subject}</h6>
          <p class="card-text">Date: ${email.timestamp}</p>
          <h4 class="card-text">${email.body}</h4>
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
  });
}
