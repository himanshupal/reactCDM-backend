const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateClass = async (_, { id, data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin !`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access !== (`Head of Department` || `Director`))
		throw new Forbidden(`Access Denied !!!`);
	res = await connection
		.db(`RBMI`)
		.collection(`classes`)
		.findOne({
			_id: ObjectId(id),
		});
	alias = `${data.class || res.class}, Year ${data.year || res.year} Sem ${
		data.semester || res.semester
	}`;
	res = await connection
		.db(`RBMI`)
		.collection(`classes`)
		.updateOne(
			{
				_id: ObjectId(id),
			},
			{
				$set: {
					...data,
					alias,
					lastUpdated: Date.now(),
					lastUpdatedBy: user.username,
				},
			}
		);
	return res.modifiedCount > 0
		? `Class updated !`
		: `Error saving data. Please try again or contact admin if issue persists`;
};
