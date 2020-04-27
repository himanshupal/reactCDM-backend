const { client } = require(`../../index`);

exports.getClass = async (_, { _id }) => {
  try {
    if (_id) {
      const res = await (await client)
        .db(`RBMI`)
        .collection(`classes`)
        .aggregate([
          {
            $match: {
              _id,
            },
          },
          {
            $lookup: {
              from: `students`,
              localField: `_id`,
              foreignField: `class`,
              as: `students`,
            },
          },
          {
            $lookup: {
              from: `attendence`,
              localField: `_id`,
              foreignField: `class`,
              as: `attendence`,
            },
          },
        ])
        .toArray();
      return res.map((el) => {
        return { ...el, totalStudents: el.students.length };
      });
    }
    const res = await (await client)
      .db(`RBMI`)
      .collection(`classes`)
      .aggregate([
        {
          $lookup: {
            from: `students`,
            localField: `_id`,
            foreignField: `class`,
            as: `students`,
          },
        },
        {
          $lookup: {
            from: `attendence`,
            localField: `_id`,
            foreignField: `class`,
            as: `attendence`,
          },
        },
      ])
      .toArray();
    return res.map((el) => {
      return { ...el, totalStudents: el.students.length };
    });
  } catch (error) {
    throw new Error(error);
  }
};
