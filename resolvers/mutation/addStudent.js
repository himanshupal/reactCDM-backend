const { client } = require(`../../index`);

exports.addStudent = async (_, { input }) => {
  try {
    const res = await (await client)
      .db(`RBMI`)
      .collection(`students`)
      .insertOne({
        _id: input._id,
        rollNumber: input.rollNumber,
        registrationNumber: input.registrationNumber,
        enrollmentNumber: input.enrollmentNumber,
        registeredOn: Date.now(),
        class: input.class,
        name: {
          first: input.name.first,
          last: input.name.last,
        },
        father: {
          name: input.father.name,
          occupation: input.father.occupation,
          annualSalary: input.father.annualSalary,
          contactNumber: input.father.contactNumber,
        },
        mother: {
          name: input.mother.name,
          occupation: input.mother.occupation,
          annualSalary: input.mother.annualSalary,
          contactNumber: input.mother.contactNumber,
        },
        bloodGroup: input.bloodGroup,
        gender: input.gender,
        caste: input.caste,
        class: input.class,
        religion: input.religion,
        dateOfBirth: input.dateOfBirth,
        address: {
          current: {
            locality: input.address.current.locality,
            district: input.address.current.district,
            city: input.address.current.city,
            pincode: input.address.current.pincode,
            state: input.address.current.state,
          },
          permanent: {
            locality: input.address.permanent.locality,
            district: input.address.permanent.district,
            city: input.address.permanent.city,
            pincode: input.address.permanent.pincode,
            state: input.address.permanent.state,
          },
        },
        photo: input.photo,
        email: input.email,
        aadharNumber: input.aadharNumber,
        contactNumber: input.contactNumber,
        dateOfLeaving: input.dateOfLeaving,
      });
    return res.insertedId;
  } catch (error) {
    throw new Error(error);
  }
};
