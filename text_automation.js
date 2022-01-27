
// ________________________________________________________________________________
// Account Information

var ACCOUNT_SID = 'ACdaf4e42b20563e37addd6185bc360161';
var ACCOUNT_TOKEN = '1268edbded175a4b4a2c2f9e60e6658b';
var TWILIO_NUMBER = "2055764964";


var SENDER_NAME = "Rohan";
var SENDER_NUMBER = "4083298470";

var RUSH_TEXT = "Hey it's Rohan from Phi Tau, come out to our first official rush event from 6-9 at 310 E Gregory Dr. If you have any questions, feel free to shoot me a text at " + SENDER_NUMBER;

var START_ROW = 2;
var START_COLUMN = 1;

// ________________________________________________________________________________



var ACCOUNT_ENCRYPTION = ACCOUNT_SID + ":" + ACCOUNT_TOKEN;

var PHONE_NUMBER_COLUMN = START_COLUMN + 1;
var NAME_COLUMN = START_COLUMN;
var VALIDATION_COLUMN = START_COLUMN + 2;

var ValidationEnum = {
  VALID: "Yes",
  INVALID: "No"
};


function isPhoneNumberValid(phoneNumber) {
    var lookupUrl = "https://lookups.twilio.com/v1/PhoneNumbers/" + phoneNumber + "?Type=carrier"; 

    var options = {
        "method" : "get"
    };

    options.headers = {    
        "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_ENCRYPTION)
    };
  
    try { 
      var response = UrlFetchApp.fetch(lookupUrl, options);
      var data = JSON.parse(response); 
      Logger.log(data); 
      if (data['status'] == 404) { 
        return false;
      }
    } catch(err) {
      Logger.log("Couldn't find phone number");
      return false;
    }
  
  return true;
}

function test() {
  console.log(isPhoneNumberValid(SENDER_NUMBER));
}


function sendSms(to, name) {
  var messages_url = "https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json";
  
  var text_body = RUSH_TEXT.replace("{name}", name);
  Logger.log("Phone number: " + to);
  Logger.log("Phone text: " + text_body);

  var payload = {
    "To": to,
    "Body" : text_body,
    "From" : TWILIO_NUMBER
  };

  var options = {
    "method" : "post",
    "payload" : payload
  };

  options.headers = { 
    "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_ENCRYPTION)
  };

  UrlFetchApp.fetch(messages_url, options);
}


function sendEventText() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var numRows = sheet.getLastRow() - 1; 
  var numColumns = 4;
  var dataRange = sheet.getRange(START_ROW, START_COLUMN, numRows, numColumns);
  var data = dataRange.getValues();

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    try {
      var first_name = row[NAME_COLUMN] + "";
      var split_name = first_name.split(" ")[0];
      var phone_number = row[PHONE_NUMBER_COLUMN] + "";
      
      var isValid = isPhoneNumberValid(phone_number);
        
      if (isValid) {
        sheet.getRange(i + START_ROW, VALIDATION_COLUMN + 1).setValue(ValidationEnum.VALID);
        response_data = sendSms(phone_number, split_name);
        status = "sent";
      }
      else {
        sheet.getRange(i + START_ROW, VALIDATION_COLUMN + 1).setValue(ValidationEnum.INVALID);
      }
      
    } catch(err) {
      Logger.log(err);
      status = "error";
    }
    
  }
  
}

