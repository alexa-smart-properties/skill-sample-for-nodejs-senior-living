// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

// Alexa SDK
const Alexa = require('ask-sdk');

// Import helper functions and data
const util = require('./util.js');
const constants = require('./constants.js');

/*
 * Common handler for informational requests, such as accessibility info.
 */
function handleInfoRequest(handlerInput, intentName, outputPromptName) {
    const { attributesManager, responseBuilder } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    let sessionAttributes = attributesManager.getSessionAttributes();

    console.info(`${sessionAttributes[constants.STATE]}, intentName`);

    let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
    let speakOutput = `${requestAttributes.t(outputPromptName)} `;

    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
        let template = require('./apl/headline.json');

        // Add the RenderDocument directive to the response
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: template.document,
            datasources: {
                "headlineTemplateData": {
                    "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                    "text": "Welcome to Senior Living Smart Property demo skill.",
                    "sub": " ",
                    "logoUrl": "",
                    "hintText": "Try, \"Alexa, start my day.\""
                }
            }
        });
    }

    let bEndSession = false;
    if (Alexa.isNewSession(handlerInput.requestEnvelope)) {
        bEndSession = true;
    }
    else {
        responseBuilder.reprompt(repromptOutput);
        speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
    }
    return responseBuilder
        .withShouldEndSession(bEndSession)
        .speak(speakOutput)
        .getResponse();
}

/**
 * Common handler for requests that require a ticket to the Senior Living staff, such as a call for help.
 * TO DO: the unit/room name here should be retrieved by looking up the persistent unit id against a table look up with names : Handler should o a persistent unit id to room mapping lookup to get the room name and then insert the room name into the output message to the staff here.
 */
function handleStaffRequest(handlerInput, intentName, outputPromptName, outputPromptStaffMessageName) {
    const { attributesManager, responseBuilder } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    let sessionAttributes = attributesManager.getSessionAttributes();

    console.info(`${sessionAttributes[constants.STATE]}, intentName`);

    let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
    let speakOutput = `${requestAttributes.t(outputPromptName)}`;
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
        let template = require('./apl/headline.json');

        // Add the RenderDocument directive to the response
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: template.document,
            datasources: {
                "headlineTemplateData": {
                    "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.NURSE),
                    "text": "The staff is on the way to help.",
                    "sub": " ",
                    "logoUrl": "",
                    "hintText": "Try, \"Alexa, play calming music.\""
                }
            }
        });
    } 
    notifyStaffByPrompt(handlerInput, outputPromptStaffMessageName);

    let bEndSession = false;
    if (Alexa.isNewSession(handlerInput.requestEnvelope)) {
        bEndSession = true;
    } else {
        responseBuilder.reprompt(repromptOutput);
        speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
    }
    return responseBuilder
        .withShouldEndSession(bEndSession)
        .speak(speakOutput)
        .getResponse();
}

/*
 * Implement these functions so that a request can be sent to your property's staff. For example, it can be an 
 * API call to your facility's Emergency Medical Services (EMS); a text message to the staff; etc.
 */
function notifyStaffByPrompt(handlerInput, outputPromptStaffMessageName) {
    const { attributesManager, responseBuilder } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    let sessionAttributes = attributesManager.getSessionAttributes();

    notifyStaffByMessage(handlerInput, `${requestAttributes.t(outputPromptStaffMessageName)}`);
}
function notifyStaffByMessage(handlerInput, outputStaffMessage) {
    // To be implemented
    console.info("Your specific notification logic would be sent here");
}


module.exports = {

    ToiletingIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'ToiletingIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'ToiletingIntent', 'PROMPT_TOILETING', 'PROMPT_STAFF_BATHROOM_MESSAGE')
                
            } 
    },

    TalkIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'TalkIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'TalkIntent', 'PROMPT_TALK', 'PROMPT_STAFF_TALK_MESSAGE')
        }
    },
    
    PainIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'PainIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'PainIntent', 'PROMPT_PAIN', 'PROMPT_STAFF_PAIN_MESSAGE')
        }
    },
    
    MedicationIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'MedicationIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'MedicationIntent', 'PROMPT_MEDICATION', 'PROMPT_STAFF_MEDICATION_MESSAGE')
        }
    },  

    MobilityIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'MobilityIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'MobilityIntent', 'PROMPT_MOBILITY', 'PROMPT_STAFF_MOBILITY_MESSAGE')
        }
    },

    FallIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'HelpFallIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'HelpFallIntent', 'PROMPT_FALL', 'PROMPT_STAFF_FALL_MESSAGE')
        }
    },

    
    HelpGeneralIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'HelpGeneralIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'HelpGeneralIntent', 'PROMPT_HELP', 'PROMPT_STAFF_HELP_MESSAGE')
        }
    },

    BloodPressureIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'BloodPressureIntent';
        },
        handle(handlerInput) {
            return handleStaffRequest(handlerInput, 'BloodPressureIntent', 'PROMPT_BLOOD_PRESSURE', 'PROMPT_STAFF_BLOOD_PRESSURE_MESSAGE')
        }
    },

    /**
     * This handler should retrieve the resident's calendar/event info from the onsite system to give resident inforamtion about their daily schedule
    */ 
    StartMyDayIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'StartMyDayIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();
    
            console.info(`${sessionAttributes[constants.STATE]}, StartMyDayIntent`);
    
            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_STARTMYDAY')} `;
           
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {   
                let template = require('./apl/headline.json');
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.GOODMORNING),
                            "text": "It is going to be a good day today.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, give me the news.\""
                        }
                    }
                });    
            }

            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Handler to process room service requests
     */
    RoomServiceIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'RoomServiceIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, Room_Service`);

            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;  
            let speakOutput = `${requestAttributes.t('PROMPT_ROOM_SERVICE')} `;
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                            "text": "Welcome to Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, start my day.\""
                        }
                    }
                }); 
            } 
            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Handler to process unit/room maintenace service requests
     */
    MaintenanceIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'MaintenanceIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, MaintenanceIntent`);

            let apartmentItem = util.getSlotResolution(handlerInput, 'Apartment_Item');
            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_MAINTENANCE')} `;
            let messageBody = `${requestAttributes.t('PROMPT_STAFF_MAINTENANCE_MESSAGE')}`;

            // fix the item in the output string
            if ((apartmentItem) && (apartmentItem.length > 0)) {
                speakOutput = speakOutput.replace('APARTMENTITEM', apartmentItem);
                messageBody = messageBody.replace('APARTMENTITEM', apartmentItem);
            } else {
                speakOutput = speakOutput.replace('APARTMENTITEM', 'household item');
                messageBody = messageBody.replace('APARTMENTITEM', 'household item');
            }

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.REPAIR),
                            "text": "The maintenance staff is on the way to help.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, play calming music.\""
                        }
                    }
                });  
            } 
            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /*
    * This handler should retrieve the activities information should be retrieved with the senior living facilities' onsite calendar system 
    * for the particular room/unit and incorporated into the output speech string.
    */
    CalendarEventInfoIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'CalendarEventInfoIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, CalendarEventInfoIntent`);

            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_TOMORROW_ACTIVITIES')} `;
            // Compare the dataslot with today's date, so you can put in the right actvity (today, or not today)
            // we only care about if the date matches (today), so just set both date() hours to midnight (0,0,0,0)
            let dateSlot = new Date(util.getSlotResolution(handlerInput, 'Date', 'AMAZON.DATE'));
            dateSlot.setHours(0,0,0,0);
            let todayDate = new Date();
            todayDate.setHours(0,0,0,0);

            console.info('specified date: ' + dateSlot.toString());

            if (dateSlot.getTime() === todayDate.getTime()) {
                speakOutput = `${requestAttributes.t('PROMPT_TODAY_ACTIVITIES')} `;
            }

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.ACTIVITY),
                            "text": "There is a lot you can do at Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, give me the news.\""
                        }
                    }
                });
                
            } 
            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Handler to process food menu related requests and the menu information should be retrieved from property database
     */
    MenuInfoIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'MenuInfoIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, MenuInfoIntent`);
            
            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = "";
            let mealType = util.getSlotResolution(handlerInput, "Meal", "Meal_Type");

            if (mealType == 'breakfast') {
                speakOutput = `${requestAttributes.t('PROMPT_TODAY_BREAKFAST_MENU')} `;
            } else if (mealType == 'lunch') {
                speakOutput = `${requestAttributes.t('PROMPT_TODAY_LUNCH_MENU')} `;
            } else if (mealType == 'dinner') {
                speakOutput = `${requestAttributes.t('PROMPT_TODAY_DINNER_MENU')} `;
            } else {
                // if no mealtype specified, work it out from the current time
                let todayDateTime = new Date();
                let breakfastCutoff = new Date(todayDateTime.getTime());  // 10am Mountain time = 16 UTC
                breakfastCutoff.setHours(16);
                let lunchCutoff = new Date(todayDateTime.getTime());   // 3pm/15 Mountain time = 21 UTC
                lunchCutoff.setHours(21);
                let dinnerCutoff = new Date(todayDateTime.getTime());  // 9pm/21 Mountain Time = 3 UTC (next day)
                dinnerCutoff.setHours(3);
                dinnerCutoff.set

                console.info("current hour is: " + todayDateTime.getHours());
                console.info("breakfast cutoff hour is: " + breakfastCutoff);
                console.info("lunch cutoff is: " + lunchCutoff);
                console.info("dinner cutoff is " + dinnerCutoff);
                
                if (todayDateTime < breakfastCutoff) {
                    speakOutput = `${requestAttributes.t('PROMPT_TODAY_BREAKFAST_MENU')} `;
                } else if (todayDateTime < lunchCutoff) {
                    speakOutput = `${requestAttributes.t('PROMPT_TODAY_LUNCH_MENU')} `;
                } else if (todayDateTime < dinnerCutoff) {
                    speakOutput = `${requestAttributes.t('PROMPT_TODAY_DINNER_MENU')} `;
                } else {
                    // give next day's breakfast menu (use the same one)
                    speakOutput = `${requestAttributes.t('PROMPT_TODAY_BREAKFAST_MENU')} `;
                }    
            }

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LUNCH),
                            "text": "Bon Appétit!",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, give me the news.\""
                        }
                    }
                });               
            } 
            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Handler to process general services requests
     */
    ServicesIntentHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'ServicesIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, ServicesIntent`);

            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_SERVICES')} `;

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                            "text": "Welcome to Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, start my day.\""
                        }
                    }
                }); 
            } 
            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + requestAttributes.t('PROMPT_WHAT_CAN_I_HELP');
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },
  
};
