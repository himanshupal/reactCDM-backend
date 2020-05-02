const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getStudent = async (_, { _id }, { headers }) => {
	const user = CheckAuth(headers.authorization);
	if (user.access !== `student` && !_id)
		throw new Error(`Arguments missing...`, {
			error: `You must provide a studentId as _id to get student details !!!`,
		});
	if (user.access === `student`) return findStudent(user.username);
	return findStudent(_id);
};

const findStudent = async (studentId) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`students`)
			.aggregate([
				{
					$match: {
						studentId,
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
