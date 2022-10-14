import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  comment: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackBlog'
    }
  ]
});

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

export default mongoose.model('Comment', commentSchema);
