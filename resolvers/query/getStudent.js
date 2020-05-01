const { client, Error } = require(`../../index`);

exports.getStudent = async (_, { _id }) => {
	if (!_id)
		throw new Error(`Arguments missing...`, {
			error: `You must provide a studentId as _id to get student details !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`students`)
			.aggregate([
				{
					$match: {
						_id,
					},
				},
				{
					$lookup: {
						from: `attendence`,
						localField: `_id`,
						foreignField: `students`,
						as: `attendence`,
					},
				},
				{
					$lookup: {
						from: `classes`,
						localField: `class`,
						foreignField: `_id`,
						as: `class`,
					},
				},
				{
					$unwind: `$class`,
				},
			])
			.toArray();
		if (res.length === 0)
			throw new Error(`Not found...`, {
				error: `No student found matching given _id...`,
			});
		return res[0];
	} catch (error) {
		throw new Error(error);
	}
};
