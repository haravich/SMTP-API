# SMTP-API

Keeping the Mail Server in public is high risk. If you need mail server in public without security risks.
I have a solution designed for you.

# API

Using the API interfacing with our Mail Server, We can build our Solution. We are running our API as a web service. We use JSON data as a payload to our API's, We can send the emails from our Mail Server and that too with authentication and web tokens.

# Interesting isn't it?

The solution is compraised Postfix, Nodejs and MongoDB. The installation process is tested in Ubuntu 14.04 LTS.

![](Mail.png)

# Current Issues

As, we see in the diagram only local users can send mails from out SMTP server. External users are not allowed to access our mail server.

If external users wants to connect to SMTP server, we can open SMTP port in our mail server. Which would lead to vulnerabilities.

# Our Solution

Our solution is to allow external users or external networks to send e-mail from our mail server. Here, we are not exposing the SMTP Port. We run as Web service. To make it more secure, we use HTTP over SSL (HTTPS). We need a backend DB to store user information for authentication. Once the user is authorized, the user should send mail in 60 seconds, else authorized token expires. We need to re-authenticate for sending mails.
All mails originate from our local network, eventhough user is from external network.