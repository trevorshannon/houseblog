"""Sends an email to a list of recipients with a blog update.

Usage:
  mail_notification.py <posttitle>
"""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from docopt import docopt
import smtplib

SUBSCRIBERS_FILE = '/var/www/house/script/subscribers.txt'
SENDER = 'katieandtrevor@pi.dektar.com'
REPLY_TO = 'trevor.j.shannon@gmail.com'


def load_recipients():
  # Include the REPLY_TO in the recipients, as all others will be bcc'd.
  recipients = [REPLY_TO]
  with open(SUBSCRIBERS_FILE, 'r') as subscribers_file:
    for line in subscribers_file:
      recipients.append(line)
  return recipients


def build_message(posttitle):
  message = MIMEMultipart('alternative')
  message['Subject'] = 'New blog post - %s' % posttitle
  message['From'] = 'House of Granite Blog <%s>' % SENDER
  message['To'] = REPLY_TO
  message['Reply-To'] = REPLY_TO

  body = ('The House of Granite blog has a new post called "%s".  '
          'Take a look' % posttitle)
  link = 'http://house.dektar.com'
  signature = '- Katie and Trevor'
  postscript = ('p.s. If you don\'t want to get these emails any more, '
                'just let us know by replying to this message.') 

  text_msg = '%s at %s!\n\n\n%s\n\n%s' % (body, link, signature, postscript)
  html_msg = """\
<html>
  <head></head>
  <body>
    <p>%s <a href="%s">here</a>!</p>
    <p style="margin-top:2.5em">%s</p>
    <p>%s</p>
  </body>
</html>
""" % (body, link, signature, postscript)
  message.attach(MIMEText(text_msg, 'plain'))
  message.attach(MIMEText(html_msg, 'html'))
  return message


def main(args):
  try:
    recipients = load_recipients()
  except IOError:
    print "Could not load recipents from file."
    return
  message = build_message(args['<posttitle>'])
  try:  
    smtpObj = smtplib.SMTP('localhost')
    smtpObj.sendmail(SENDER, recipients, message.as_string())         
  except SMTPException:
    print "Error sending email."
    return
  print "Successfully sent email."


if __name__ == '__main__':
  args = docopt(__doc__)
  main(args)
