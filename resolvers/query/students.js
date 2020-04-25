const { client } = require(`../../index`);

exports.students = async (_, args) => {
  if (!args.class) {
    throw new Error(`Class is required to get students list !!!`);
  }
  try {
    const res = await (await client)
      .db(`RBMI`)
      .collection(`students`)
      .find({ class: args.class })
      .toArray();
    if (res.length === 0)
      throw new Error(`No students in database matching given criteria !!!`);
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
