const { client, Error } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.getTeacher = async (_, { _id }, { headers }) => {
	const user = CheckAuth(headers.authorization);
	if (user.access === (`Assistant Professor` || `Associate Professor`))
		return findOne(user.username);
	if (user.access !== (`Head of Department` || `Director`))
		throw new Error(`Access Denied !!!`, {
			error: `You don't have enough permissions to perform this operation !!!`,
		});
	if (_id) return findOne(_id);
	try {
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
			if (el.classTeacher.length > 0) classTeacherOf = el.classTeacher[0]._id;
			else classTeacherOf = null;
			return { ...el, classTeacherOf };
		});
	} catch (error) {
		throw new Error(error);
	}
};

const findOne = async (teacherId) => {
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`teachers`)
			.aggregate([
				{
					$match: {
						_id: teacherId,
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
			throw new Error(`Not found...`, {
				error: `No teachers found matching given _id...`,
			});
		return res.map((el) => {
			if (el.classTeacher.length > 0) classTeacherOf = el.classTeacher[0]._id;
			else classTeacherOf = null;
			return { ...el, classTeacherOf: el.classTeacher._id };
		});
	} catch {
		throw new Error(`Not found...`, {
			error: `No teacher found matching given _id...`,
		});
	}
};
