const { client } = require(`../../index`);

exports.classes = async (_, args) => {
  try {
    if (args._id) {
      const classData = await (await client)
        .db(`RBMI`)
        .collection(`classes`)
        .aggregate([
          {
            $match: {
              _id: args._id,
            },
          },
          {
            $lookup: {
              from: "students",
              localField: "_id",
              foreignField: "class",
              as: "students",
            },
          },
          {
            $lookup: {
              from: "attendence",
              localField: "_id",
              foreignField: "class",
              as: "attendence",
            },
          },
        ])
        .toArray();
      return classData.map((el) => {
        return { ...el, totalStudents: el.students.length };
      });
    }
    const classData = await (await client)
      .db(`RBMI`)
      .collection(`classes`)
      .aggregate([
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "class",
            as: "students",
          },
        },
        {
          $lookup: {
            from: "attendence",
            localField: "_id",
            foreignField: "class",
            as: "attendence",
          },
        },
      ])
      .toArray();
    return classData.map((el) => {
      return { ...el, totalStudents: el.students.length };
    });
  } catch (error) {
    throw new Error(error);
  }
};
