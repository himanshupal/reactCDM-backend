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
					{
						$lookup: {
							from: `subjects`,
							localField: `_id`,
							foreignField: `class`,
							as: `subjects`,
						},
					},
				])
				.toArray();
			if (res.length === 0)
				throw new Error(`No class found matching given _id...`);
			return res.map((el) => {
				return {
					...el,
					totalStudents: el.students.length,
					timeTable: el.subjects,
				};
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
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `class`,
						as: `subjects`,
					},
				},
			])
			.toArray();
		return res.map((el) => {
			return {
				...el,
				totalStudents: el.students.length,
				timeTable: el.subjects,
			};
		});
	} catch (error) {
		throw new Error(error);
	}
};
