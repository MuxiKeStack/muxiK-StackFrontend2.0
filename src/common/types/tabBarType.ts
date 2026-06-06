export type TabItemProps = {
  name: string;
  icon: string;
  key: string;
};

export interface TabBarProps {
  tabs: TabItemProps[];
  onTabClick: (tabKey: string) => void;
}
