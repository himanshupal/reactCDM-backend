const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getStudent = async (_, { id }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student` && id) throw new Forbidden(`Access Denied !!!`);
	res = await connection
		.db(`RBMI`)
		.collection(`students`)
		.aggregate([
			{
				$match: {
					$or: [
						{
							_id: ObjectId(id),
						},
						{
							username: user.username,
						},
					],
				},
			},
			{
				$lookup: {
					from: `attendence`,
					localField: `username`,
					foreignField: `students`,
					as: `attendence`,
				},
			},
			{
				$addFields: { class: { $toObjectId: `$class` } },
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
	return res[0];
};
