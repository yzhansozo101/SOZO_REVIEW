// Lucide-style line icons (1.5px stroke) used across the kit.
// Stick to this set — see README ICONOGRAPHY for inventory.

const Icon = ({ d, size = 16, stroke = 1.75, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {d}
  </svg>
);

const IconLink = (p) => <Icon {...p} d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>}/>;
const IconLoader = (p) => <Icon {...p} d={<path d="M21 12a9 9 0 1 1-6.219-8.56"/>}/>;
const IconDownload = (p) => <Icon {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/>;
const IconMail = (p) => <Icon {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></>}/>;
const IconMailCheck = (p) => <Icon {...p} d={<><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="m22 7-10 5L2 7"/><path d="m16 19 2 2 4-4"/></>}/>;
const IconExternal = (p) => <Icon {...p} d={<><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>}/>;
const IconAlert = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>;
const IconChevronRight = (p) => <Icon {...p} d={<polyline points="9 18 15 12 9 6"/>}/>;
const IconArrowUpRight = (p) => <Icon {...p} d={<><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>}/>;
const IconArrowDownRight = (p) => <Icon {...p} d={<><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></>}/>;
const IconMinus = (p) => <Icon {...p} d={<line x1="5" y1="12" x2="19" y2="12"/>}/>;
const IconPlay = (p) => <Icon {...p} d={<polygon points="6 4 20 12 6 20 6 4"/>}/>;

Object.assign(window, {
  Icon, IconLink, IconLoader, IconDownload, IconMail, IconMailCheck,
  IconExternal, IconAlert, IconChevronRight, IconArrowUpRight, IconArrowDownRight,
  IconMinus, IconPlay,
});
