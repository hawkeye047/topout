export const DEMO_DATA = {
  projectName: '5,000 SF Midtown Office Fitout',
  projectStart: '2026-05-04',
  projectEnd: '2026-10-12',
  totalBudget: 1500000,
  phases: [
    {
      name: 'Preconstruction',
      activities: [
        { name: 'Landlord Plan Approval', start: '2026-05-04', end: '2026-05-15', duration: 10, status: 'complete', owner: 'GC', notes: 'Submitted 4/20' },
        { name: 'DOB Permit Filing', start: '2026-05-11', end: '2026-05-29', duration: 15, status: 'complete', owner: 'Expediter', notes: 'Alt-2 work permit' },
        { name: 'Subcontractor Buyout', start: '2026-05-04', end: '2026-05-15', duration: 10, status: 'complete', owner: 'GC', notes: '' },
        { name: 'Submittals & Shop Dwgs', start: '2026-05-18', end: '2026-06-05', duration: 15, status: 'in-progress', owner: 'All Trades', notes: 'HVAC pending' },
      ],
    },
    {
      name: 'Demolition & Abatement',
      activities: [
        { name: 'ACM Survey & Lead Testing', start: '2026-06-01', end: '2026-06-03', duration: 3, status: 'complete', owner: 'Environmental', notes: '' },
        { name: 'Asbestos Abatement', start: '2026-06-04', end: '2026-06-10', duration: 5, status: 'in-progress', owner: 'Abatement Sub', notes: 'Floor tile ACM' },
        { name: 'Selective Demolition', start: '2026-06-08', end: '2026-06-17', duration: 8, status: 'not-started', owner: 'Demo Sub', notes: 'Partitions + ceiling' },
        { name: 'Slab Prep & Patching', start: '2026-06-18', end: '2026-06-20', duration: 3, status: 'not-started', owner: 'Demo Sub', notes: '' },
      ],
    },
    {
      name: 'Rough-In (MEP)',
      activities: [
        { name: 'Plumbing Rough-In', start: '2026-06-15', end: '2026-06-26', duration: 10, status: 'not-started', owner: 'Plumber', notes: 'Underground first' },
        { name: 'HVAC Ductwork Rough-In', start: '2026-06-15', end: '2026-07-03', duration: 15, status: 'not-started', owner: 'Mechanical', notes: 'Main trunk + branches' },
        { name: 'Electrical Rough-In', start: '2026-06-18', end: '2026-07-01', duration: 12, status: 'not-started', owner: 'Electrician', notes: 'Panel + conduit' },
        { name: 'Sprinkler Rough-In', start: '2026-06-22', end: '2026-07-01', duration: 8, status: 'not-started', owner: 'FP Sub', notes: '' },
        { name: 'Fire Alarm Rough-In', start: '2026-06-29', end: '2026-07-03', duration: 5, status: 'not-started', owner: 'FA Sub', notes: '' },
        { name: 'Low Voltage Rough-In', start: '2026-06-29', end: '2026-07-08', duration: 8, status: 'not-started', owner: 'LV Sub', notes: 'Cat6A + fiber' },
      ],
    },
    {
      name: 'Framing & Drywall',
      activities: [
        { name: 'Metal Stud Framing', start: '2026-06-29', end: '2026-07-10', duration: 10, status: 'not-started', owner: 'Drywall Sub', notes: '' },
        { name: 'In-Wall MEP Coord', start: '2026-07-13', end: '2026-07-15', duration: 3, status: 'not-started', owner: 'All Trades', notes: 'Walk-through' },
        { name: 'Insulation', start: '2026-07-16', end: '2026-07-18', duration: 3, status: 'not-started', owner: 'Drywall Sub', notes: 'Acoustic + rated' },
        { name: 'Drywall Hang', start: '2026-07-20', end: '2026-07-29', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: '' },
        { name: 'Tape & Spackle', start: '2026-07-30', end: '2026-08-08', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: 'Level 4/5' },
      ],
    },
    {
      name: 'Ceiling',
      activities: [
        { name: 'ACT Grid Installation', start: '2026-08-10', end: '2026-08-14', duration: 5, status: 'not-started', owner: 'Ceiling Sub', notes: '' },
        { name: 'Drywall Ceiling', start: '2026-08-06', end: '2026-08-14', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: 'Conf + reception' },
        { name: 'Cloud Panels', start: '2026-08-17', end: '2026-08-19', duration: 3, status: 'not-started', owner: 'Ceiling Sub', notes: '' },
      ],
    },
    {
      name: 'Finishes',
      activities: [
        { name: 'Painting', start: '2026-08-10', end: '2026-08-19', duration: 8, status: 'not-started', owner: 'Painter', notes: 'Primer + 2 coats' },
        { name: 'Floor Prep', start: '2026-08-17', end: '2026-08-19', duration: 3, status: 'not-started', owner: 'Flooring Sub', notes: '' },
        { name: 'Tile (Pantry/Restrooms)', start: '2026-08-20', end: '2026-08-26', duration: 5, status: 'not-started', owner: 'Tile Sub', notes: '' },
        { name: 'LVT Installation', start: '2026-08-24', end: '2026-08-28', duration: 5, status: 'not-started', owner: 'Flooring Sub', notes: '' },
        { name: 'Carpet Tile', start: '2026-08-27', end: '2026-09-01', duration: 4, status: 'not-started', owner: 'Flooring Sub', notes: '' },
        { name: 'Base Installation', start: '2026-09-01', end: '2026-09-03', duration: 3, status: 'not-started', owner: 'Flooring Sub', notes: '' },
      ],
    },
    {
      name: 'MEP Trim & Close-In',
      activities: [
        { name: 'HVAC Diffusers & Grilles', start: '2026-08-24', end: '2026-08-27', duration: 4, status: 'not-started', owner: 'Mechanical', notes: '' },
        { name: 'DDC/BMS Controls', start: '2026-08-27', end: '2026-09-02', duration: 5, status: 'not-started', owner: 'Controls Sub', notes: '' },
        { name: 'Electrical Devices & Fixtures', start: '2026-08-24', end: '2026-08-28', duration: 5, status: 'not-started', owner: 'Electrician', notes: '' },
        { name: 'Plumbing Fixtures', start: '2026-08-27', end: '2026-09-01', duration: 4, status: 'not-started', owner: 'Plumber', notes: '' },
        { name: 'Sprinkler Head Trim', start: '2026-08-27', end: '2026-08-28', duration: 2, status: 'not-started', owner: 'FP Sub', notes: '' },
        { name: 'Fire Alarm Devices', start: '2026-08-27', end: '2026-08-31', duration: 3, status: 'not-started', owner: 'FA Sub', notes: '' },
        { name: 'LV Terminations', start: '2026-09-01', end: '2026-09-05', duration: 5, status: 'not-started', owner: 'LV Sub', notes: '' },
      ],
    },
    {
      name: 'Millwork & Specialties',
      activities: [
        { name: 'Reception Desk', start: '2026-09-01', end: '2026-09-03', duration: 3, status: 'not-started', owner: 'Millwork Sub', notes: '' },
        { name: 'Pantry Cabinetry', start: '2026-09-01', end: '2026-09-05', duration: 5, status: 'not-started', owner: 'Millwork Sub', notes: '' },
        { name: 'Glass Partitions', start: '2026-08-27', end: '2026-09-02', duration: 5, status: 'not-started', owner: 'Glass Sub', notes: '' },
        { name: 'Signage & Wayfinding', start: '2026-09-08', end: '2026-09-09', duration: 2, status: 'not-started', owner: 'Signage Sub', notes: '' },
        { name: 'Window Treatments', start: '2026-09-08', end: '2026-09-10', duration: 3, status: 'not-started', owner: 'Shade Sub', notes: '' },
      ],
    },
    {
      name: 'FF&E & Closeout',
      activities: [
        { name: 'Furniture Delivery & Install', start: '2026-09-14', end: '2026-09-18', duration: 5, status: 'not-started', owner: 'Furniture Dealer', notes: '' },
        { name: 'AV Install & Programming', start: '2026-09-14', end: '2026-09-17', duration: 4, status: 'not-started', owner: 'AV Sub', notes: '' },
        { name: 'Access Control & CCTV', start: '2026-09-14', end: '2026-09-16', duration: 3, status: 'not-started', owner: 'Security Sub', notes: '' },
        { name: 'Punch List Walk', start: '2026-09-21', end: '2026-09-23', duration: 3, status: 'not-started', owner: 'A/E + Owner', notes: '' },
        { name: 'Punch List Completion', start: '2026-09-24', end: '2026-09-30', duration: 5, status: 'not-started', owner: 'All Trades', notes: '' },
        { name: 'TAB (Test & Balance)', start: '2026-09-21', end: '2026-09-23', duration: 3, status: 'not-started', owner: 'TAB Contractor', notes: '' },
        { name: 'Commissioning', start: '2026-09-24', end: '2026-09-26', duration: 3, status: 'not-started', owner: 'Cx Agent', notes: '' },
        { name: 'DOB / FDNY Inspections', start: '2026-09-28', end: '2026-09-30', duration: 3, status: 'not-started', owner: 'Expediter', notes: '' },
        { name: 'Final Clean', start: '2026-10-01', end: '2026-10-02', duration: 2, status: 'not-started', owner: 'Cleaning', notes: '' },
        { name: 'Substantial Completion', start: '2026-10-05', end: '2026-10-05', duration: 1, status: 'not-started', owner: 'GC', notes: 'TCO' },
        { name: 'Move-In', start: '2026-10-06', end: '2026-10-09', duration: 3, status: 'not-started', owner: 'Tenant', notes: '' },
      ],
    },
  ],
};
