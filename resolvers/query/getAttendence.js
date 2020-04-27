const { client } = require(`../../index`);

exports.getAttendence = async (_, args) => {
  if (!args._id || !args.class) {
    throw new Error(
      `You must provide a date & class as _id & class to get attendence details !!!`
    );
  }
  try {
    return await (await client).db(`RBMI`).collection(`attendence`).findOne({
      _id: args._id,
      class: args.class,
    });
  } catch (error) {
    throw new Error(error);
  }
};
