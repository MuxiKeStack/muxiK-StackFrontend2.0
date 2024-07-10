import {
  View,
  Picker,
  Text
} from "@tarojs/components";
import { useState, useEffect } from "react";
import "./myclass.scss";
interface CouresProps {
  name:string,
  teacher:string,
  evaluated:boolean,
  year:string,
  term:string,
  id:number
}
import {getUserCourses} from "@/api/getUserCourses";
export default function Myclass() {
  const [yearSelector, setYearSelector] = useState([
    "2022-2023学年",
    "2023-2024学年",
    "2024-2025学年",
    "2025-2026学年",
  ]);

  const [year, setYear] = useState("2022-2023学年");

  const onTimeChange = (e) => {
    const { detail } = e;
    setYear(detail.value);
  };

  const semSelector = ["第一学期", "第二学期", "第三学期", "全部学期"];

  const [sem, setSem] = useState("第一学期");

  const onSemChange = (e) => {
    const { detail } = e;
    setSem(detail.value);
  };

  const [myclasses, setMyclasses] = useState<CouresProps[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const classes = await getUserCourses("2024", "1");
        setMyclasses(classes);
      } catch (error) {
        console.error("Error fetching user courses:", error);
      }
    }
    fetchClasses();
  }, []); // 空数组作为依赖，确保仅在组件挂载时执行

  return (
    <View>
      <View className="select">
        <Picker range={yearSelector} onChange={onTimeChange} mode="selector">
          <View className="selector1">
            <Text className="text">选择学年</Text>
            <View className="sjx"></View>
          </View>
        </Picker>
        <Picker range={semSelector} onChange={onSemChange} mode="selector">
          <View className="selector2">
            <Text className="text">选择学期</Text>
            <View className="sjx"></View>
          </View>
        </Picker>
      </View>
      <View className="classes">
        {myclasses.map((each, index) => (
          <View key={index} className="eachClass">
            <Text className="classname">{each.name}</Text>
            <Text className="classname">{each.teacher}</Text>
            <Text className="classstatus">
              {each.evaluated ? "已评课" : "未评课"}
            </Text>
            <Text className="jt">➜</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
