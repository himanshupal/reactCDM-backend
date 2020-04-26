const { client } = require(`../../index`);

exports.addClass = async (_, { input }) => {
  try {
    res = await (await client).db(`RBMI`).collection(`classes`).insertOne({
      _id: input._id,
      subjects: input.subjects,
    });
    return res.insertedId;
  } catch (error) {
    throw new Error(error);
  }
};
