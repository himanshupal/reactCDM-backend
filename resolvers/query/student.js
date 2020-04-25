const { client } = require(`../../index`);

exports.student = async (_, args) => {
  if (!args._id) {
    throw new Error(`You must provide an _id to get student details !!!`);
  }
  try {
    return await (await client)
      .db(`RBMI`)
      .collection(`students`)
      .findOne({ studentId: args.studentId });
  } catch (error) {
    throw new Error(error);
  }
};
