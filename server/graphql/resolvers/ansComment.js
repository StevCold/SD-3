const { UserInputError, AuthenticationError } = require('apollo-server');
const Question = require('../../models/question');
const User = require('../../models/user');
const authChecker = require('../../utils/authChecker');
const errorHandler = require('../../utils/errorHandler');

module.exports = {
  Mutation: {
    addAnsComment: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { quesId, ansId, body } = args;

      if (body.trim() === '' || body.length < 5) {
        throw new UserInputError('Comment must be atleast 5 characters long.');
      }

      try {
        const question = await Question.findById(quesId);
        if (!question) {
          throw new UserInputError(
            `Question with ID: ${quesId} does not exist in DB.`
          );
        }

        const targetAnswer = question.answers.find(
          (a) => a._id.toString() === ansId
        );

        if (!targetAnswer) {
          throw new UserInputError(
            `Answer with ID: '${ansId}' does not exist in DB.`
          );
        }

        targetAnswer.comments.push({
          body,
          author: loggedUser.id,
        });

        question.answers = question.answers.map((a) =>
          a._id.toString() !== ansId ? a : targetAnswer
        );

        const savedQues = await question.save();
        const populatedQues = await savedQues
          .populate('answers.comments.author', 'username')
          .execPopulate();

        const updatedAnswer = populatedQues.answers.find(
          (a) => a._id.toString() === ansId
        );
        return updatedAnswer.comments;
      } catch (err) {
        throw new UserInputError(errorHandler(err));
      }
    },
    deleteAnsComment: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { quesId, ansId, commentId } = args;

      try {
        const user = await User.findById(loggedUser.id);
        const question = await Question.findById(quesId);
        if (!question)
           {
          throw new UserInputError(
            `Question with ID: ${quesId} does not exist in DB.`
          );
        }

        const targetAnswer = question.answers.find(
          (a) => a._id.toString() === ansId
        );

        if (!targetAnswer) {
          throw new UserInputError(
            `Answer with ID: '${ansId}' does not exist in DB.`
          );
        }

        const targetComment = targetAnswer.comments.find(
          (c) => c._id.toString() === commentId
        );

        if (!targetComment) {
          throw new UserInputError(
            `Comment with ID: '${commentId}' does not exist in DB.`
          );
        }

        if (
          (targetComment.author.toString() !== user._id.toString() &&
          user.role !== 'admin') || user.role === 'banned'
        ) {
          if(user.role === 'banned')
          {
            const accountSid = "ACa0781efae1c0b408ade901500622000d";
            const authToken = "a3bb05e43c62fe66edf9ce6da30ae2c4";
            const client = require("twilio")(accountSid, authToken);
            client.messages
              .create({ body: "Hello from Twilio", from: "+13156692603", to: "+40742636425" })
                .then(message => console.log(message.sid));
          }
          throw new AuthenticationError('Access is denied.');
        }

        targetAnswer.comments = targetAnswer.comments.filter(
          (c) => c._id.toString() !== commentId
        );

        question.answers = question.answers.map((a) =>
          a._id.toString() !== ansId ? a : targetAnswer
        );

        await question.save();
        return commentId;
      } catch (err) {
        throw new UserInputError(errorHandler(err));
      }
    },
    editAnsComment: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { quesId, ansId, commentId, body } = args;

      if (body.trim() === '' || body.length < 5 ) {
        throw new UserInputError('Comment must be atleast 5 characters long.');
      }

      try {
        const user = await User.findById(loggedUser.id);
        const question = await Question.findById(quesId);
        if (!question) {
          throw new UserInputError(
            `Question with ID: ${quesId} does not exist in DB.`
          );
        }

        const targetAnswer = question.answers.find(
          (a) => a._id.toString() === ansId
        );

        if (!targetAnswer) {
          throw new UserInputError(
            `Answer with ID: '${ansId}' does not exist in DB.`
          );
        }

        const targetComment = targetAnswer.comments.find(
          (c) => c._id.toString() === commentId
        );

        if (!targetComment) {
          throw new UserInputError(
            `Comment with ID: '${commentId}' does not exist in DB.`
          );
        }

        if ((targetComment.author.toString() !== loggedUser.id.toString()) && user.role !== 'admin') {
          if (user.role !== 'banned') {
          
          const accountSid = "ACa0781efae1c0b408ade901500622000d";
          const authToken = "a3bb05e43c62fe66edf9ce6da30ae2c4";
          const client = require("twilio")(accountSid, authToken);
          client.messages
            .create({ body: "Hello from Twilio", from: "+13156692603", to: "+40742636425" })
              .then(message => console.log(message.sid));
          }
          throw new AuthenticationError('Access is denied.');
        }
        

        targetComment.body = body;
        targetComment.updatedAt = Date.now();

        targetAnswer.comments = targetAnswer.comments.map((c) =>
          c._id.toString() !== commentId ? c : targetComment
        );
        question.answers = question.answers.map((a) =>
          a._id.toString() !== ansId ? a : targetAnswer
        );

        const savedQues = await question.save();
        const populatedQues = await savedQues
          .populate('answers.comments.author', 'username')
          .execPopulate();

        const updatedAnswer = populatedQues.answers.find(
          (a) => a._id.toString() === ansId
        );

        return updatedAnswer.comments;
      } catch (err) {
        throw new UserInputError(errorHandler(err));
      }
    },
  },
};
