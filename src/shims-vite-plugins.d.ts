declare module 'virtual:licenses' {
  // TODO: extract plugin as package of monorepo
  // (ambient declaration cannot have relative path import)
  interface LicenseItem {
    name: string;
    license: string;
    url: string;
    category: 'dependency' | 'asset';
  }
  const Licenses: readonly LicenseItem[];
  export default Licenses;
}
