const { client } = require(`../../index`);

exports.getTeacher = async (_, { _id }) => {
	try {
		if (_id) {
			const res = await (await client)
				.db(`RBMI`)
				.collection(`teachers`)
				.aggregate([
					{
						$match: {
							_id,
						},
					},
					{
						$lookup: {
							from: `classes`,
							localField: `_id`,
							foreignField: `classTeacher`,
							as: `classTeacher`,
						},
					},
					{
						$unwind: `$classTeacher`,
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `_id`,
							foreignField: `teacher`,
							as: `teaches`,
						},
					},
				])
				.toArray();
			if (res.length === 0)
				throw new Error(`No teachers found matching given _id...`);
			return res.map((el) => {
				return { ...el, classTeacherOf: el.classTeacher._id };
			});
		}
		const res = await (await client)
			.db(`RBMI`)
			.collection(`teachers`)
			.aggregate([
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacher`,
					},
				},
				{
					$unwind: `$classTeacher`,
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `teacher`,
						as: `teaches`,
					},
				},
			])
			.toArray();
		return res.map((el) => {
			return { ...el, classTeacherOf: el.classTeacher._id };
		});
	} catch (error) {
		throw new Error(error);
	}
};
