# Build An Alexa Smart Properties Skill
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

This is a sample Alexa skill for [Alexa Smart Properties (ASP)](https://developer.amazon.com/en-US/alexa/alexa-smart-properties). Please note that ASP skills are hidden from the public catalog by default, and can only be enabled on selected properties. You are required to have an active ASP subscription and contacts at Amazon.
If you are looking for sample skills for the regular consumer version of Alexa, please refer to [Alexa Samples](https://github.com/alexa-samples) instead. 
This skill acts as an assistant in a senior living facility. Residents can ask questions such as "Alexa, what are the activities for today", or make requests like "Alexa, I am in pain", "Alexa, I need help", "Alexa, please ask staff to bring my medications". Feel free to use this sample skill as a reference, or as a template to build your own property skill(s).


## Contents
The contents of this repository is broken down into a few sub-folders.
### Skill-package
This is a copy the sample skill's interaction model. It defines the invocation name, intents and various metadata. In other words, it defines how questions can be understood. For example, an user asking "Alexa, I need help" can be mapped to a "help intent".
### Lambda
This is the backend of the sample skill. It defines how questions how handled on the server-side. This sample uses Node.js 18.x environment and would be hosted on AWS Lambda. However, you have the flexibility to decide where your backend will be hosted, and what programming language to code it with.
Parts of the lambda code are left for you to implement. For example, if your property has a staff notification system (via text etc.) that can be called via an API, you can modify the help intent handler such that whenever a user asks Alexa for help, Alexa automatically opens a ticket to your staff.
### Name-Free Interactions (NFI)
NFI allows a skill to be invoked without specifying its invocation name. For instance instead of saying "Alexa, ask [skill name] I need help", users can simply say "Alexa, I need help". In this repository we have included a sample list of golden utterances. For more information on NFI, please refer to [Understanding Name-Free Interaction for custom skills](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understand-name-free-interaction-for-custom-skills.html).

## Using This Sample Skill
If you intent to use this sample skill as a template to build your own property skill, here are the recommended high level steps:
1. Create a blank, custom Alexa skill using either the [skill console](https://developer.amazon.com/alexa/console/ask) or [command line interface (CLI)](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html). This step ensures your skill is assigned with a unique ID, and that it has the right dependency files (e.g. node_modules).
2. Use [ASK CLI commands](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-command-reference.html) to configure your new skill on a local workspace.
3. Copy the contents of skill-package and lambda to your workspace. It is important that you retain the skill ID and workspace configurations created in the previous step.
4. Use ASK CLI to perform deployment. If set up correctly, it should publish both the skill's interaction model as well as lambda.
5. Afterwards, you can start customizing the skill!

---

## Additional Resources

### Onboarding
* [ASP Overview](https://developer.amazon.com/en-US/alexa/alexa-smart-properties) - Onboarding Alexa Smart Properties (ASP)
* [Alexa Skill Kit](https://developer.amazon.com/en-US/alexa/alexa-skills-kit) - New to Alexa skills development? Start from here!

### Documentation
* [Official Alexa Smart Properties Documentation](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/about-alexa-smart-properties.html)
* [Official Alexa Skills Kit Documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)

