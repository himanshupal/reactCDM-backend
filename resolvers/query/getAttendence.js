const { client, Error } = require(`../../index`);

exports.getAttendence = async (_, { _id }) => {
	if (!_id)
		throw new Error(`Arguments missing...`, {
			error: `You must provide a date & class separated with space to get attendence details !!!`,
		});
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.aggregate([
				{
					$match: {
						_id,
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `students`,
						foreignField: `_id`,
						as: `students`,
					},
				},
			])
			.toArray();
		return res[0];
	} catch (error) {
		throw new Error(error);
	}
};
