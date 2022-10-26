import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    try {
      returnedObject.id = (returnedObject._id).toString();
    } catch (err) {

    }
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

export default mongoose.model('User', userSchema);
