const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getClass = async (_, { _id, department }, { headers }) => {
	if (!_id && !department) {
		throw new Error(`Arguments missing...`, {
			error: `You must provide either an _id for class or department for all classes within department...`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) return await classForStudent(_id);

	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{
					$match: {
						$or: [{ _id }, { department }],
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
						localField: `className`,
						foreignField: `className`,
						as: `timeTable`,
					},
				},
			])
			.toArray();
		if (res.length === 0)
			throw new Error(`Not found...`, {
				error: `No departments found matching given term...`,
			});
		return res.map((el) => {
			return {
				...el,
				totalStudents: el.students.length,
			};
		});
	} catch (error) {
		throw new Error(error);
	}
};

const classForStudent = async (className) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`classes`)
			.aggregate([
				{
					$match: {
						className,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `className`,
						foreignField: `class`,
						as: `timeTable`,
					},
				},
			])
			.toArray();
		if (res.length === 0)
			throw new Error(`Not found...`, {
				error: `No class found matching given _id...`,
			});
		return res;
	} catch (error) {
		throw new Error(error);
	}
};
