const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getAttendence = async (_, { _id }, { headers }) => {
	const user = CheckAuth(headers.authorization);
	if (user.access === `student`)
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
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
