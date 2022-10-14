import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  feedbackBlogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackBlog'
    }
  ]
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

export default mongoose.model('User', userSchema);
