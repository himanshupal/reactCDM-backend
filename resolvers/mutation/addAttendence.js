const { client } = require(`../../index`);

exports.addAttendence = async (_, { input }) => {
  if (input.holiday && input.students) {
    throw new Error(`It's holiday...`);
  }
  try {
    res = await (await client).db(`RBMI`).collection(`attendence`).insertOne({
      _id: input._id,
      holiday: input.holiday,
      students: input.students,
      present: input.students.length,
      class: input.class,
    });
    return res.insertedId;
  } catch (error) {
    throw new Error(error);
  }
};
