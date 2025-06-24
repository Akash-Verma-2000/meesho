'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          About Us
        </div>

        {/* Content */}
        <p className='p-5'>
          Jio Infocomh Limited (GIL) is a leading Public Limited Indian Non-Government Company incorporated in India on 17 June 2011 and has a history of 13 years and ten months. Its registered office is in Central Delhi, Delhi, India.
          <br />
          <br />
          The Corporate was formerly known as Fourth Dimension Solutions Private Limited. The Company is engaged in the Information Technology Industry.
          <br />
          <br />
          converted into a public limited company in the year 2015. The company got listed on National Stock exchange in the year 2016, subsequently there was a change in management board of the company in 2020. Our dedication towards our clients has become a great hallmark of our company. Our highly dedicated and self motivated staff is always available for clients. We remove obstacles and successfully lead you project from implement to delivery stage.
          <br />
          <br />
          Jio Infocomh Limited is an Information Technology (IT) Infrastructure, technical support services and operations outsourcing company head quartered at New Delhi, India, The company is engaged in outsourcing activities like eGovernance, CSC, enrollment services, Manpower provisioning, scanning and digitization, Citizen service Centers, IT Services etc
          <br />
          <br />
          CIN/LLPIN:L74110DL2011PLC221111
          <br />
          <br />
          HEAD OFFICE:India Delhi New Delhi710, Naurang House, K G Road, ConnaughtPlace, New-Delhi-110001
          <br />
          <br />
          We are a supply chain system. He can bring more benefits to consumers all over the world.This platform is a third-party intelligent matching platform. Platform and existing shopping platform merchants
          <br />
          <br />
          (such as Paytm Mall, Ebay, Flipkart, Snapdeal,Online shopping platform merchants such as IndiaMart, Myntra, etc.) use intelligent systems to match merchant orders with platform users. In order to add sales data of large stores on various platforms.
          <br />
          <br />
          In order to create the best rebate conditions for our users, we have developed a more effective reward system and rules, and provided consumer participation throughout the purchase process. Our unique high ROIProven to increase product visits and sales. Users only need to provide the real delivery address, phone number and real shopping information on the platform, and the intelligent system can transmit the order to the cloud host in the mall and match the corresponding instructions.
          <br />
          <br />
          The platform keeps all your information highly confidential
          <br />
          <br />
          Once you join, you only need to complete 3-5 part-time tasks to become a full-time employee. becomeAfter becoming a full-time employee, you can get a fixed salary of at least Rs 9,888 per day.
          <br />
          <br />
          WE AREISO 9001:2015CERTIFIED COMPANY& REGISTEREDWITH NSIC
        </p>

        {/* Place the image here */}
        <div className='p-5'>
          <Image src="/images/Certificate.jpg" alt="Certificate" width={1920} height={1920} />
          <Image src="/images/iso1.png" alt="ISO Certificate 1" width={1920} height={1920} className='my-5' />
          <Image src="/images/iso2.png" alt="ISO Certificate 2" width={1920} height={1920} />
        </div>

      </div>

    </WebsiteLayout>
  );
} 