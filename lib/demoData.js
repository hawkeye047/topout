export const DEMO_DATA = {
  projectName: '5,000 SF Midtown Office Fitout',
  projectStart: '2026-05-04',
  projectEnd: '2026-10-12',
  totalBudget: 1500000,
  phases: [
    {
      name: 'Preconstruction',
      activities: [
        { id: 'A1000', name: 'Landlord Plan Approval', start: '2026-05-04', end: '2026-05-15', duration: 10, status: 'complete', owner: 'GC', notes: 'Submitted 4/20', budgetedCost: 0 },
        { id: 'A1010', name: 'DOB Permit Filing', start: '2026-05-11', end: '2026-05-29', duration: 15, status: 'complete', owner: 'Expediter', notes: 'Alt-2 work permit', budgetedCost: 0 },
        { id: 'A1020', name: 'Subcontractor Buyout', start: '2026-05-04', end: '2026-05-15', duration: 10, status: 'complete', owner: 'GC', notes: '', budgetedCost: 0 },
        { id: 'A1030', name: 'Submittals & Shop Dwgs', start: '2026-05-18', end: '2026-06-05', duration: 15, status: 'in-progress', owner: 'All Trades', notes: 'HVAC pending', budgetedCost: 0 },
      ],
    },
    {
      name: 'Demolition & Abatement',
      activities: [
        { id: 'A2000', name: 'ACM Survey & Lead Testing', start: '2026-06-01', end: '2026-06-03', duration: 3, status: 'complete', owner: 'Environmental', notes: '', budgetedCost: 8000 },
        { id: 'A2010', name: 'Asbestos Abatement', start: '2026-06-04', end: '2026-06-10', duration: 5, status: 'in-progress', owner: 'Abatement Sub', notes: 'Floor tile ACM', budgetedCost: 17000 },
        { id: 'A2020', name: 'Selective Demolition', start: '2026-06-08', end: '2026-06-17', duration: 8, status: 'not-started', owner: 'Demo Sub', notes: 'Partitions + ceiling', budgetedCost: 25000 },
        { id: 'A2030', name: 'Slab Prep & Patching', start: '2026-06-18', end: '2026-06-20', duration: 3, status: 'not-started', owner: 'Demo Sub', notes: '', budgetedCost: 12000 },
      ],
    },
    {
      name: 'Rough-In (MEP)',
      activities: [
        { id: 'A3000', name: 'Plumbing Rough-In', start: '2026-06-15', end: '2026-06-26', duration: 10, status: 'not-started', owner: 'Plumber', notes: 'Underground first', budgetedCost: 45000 },
        { id: 'A3010', name: 'HVAC Ductwork Rough-In', start: '2026-06-15', end: '2026-07-03', duration: 15, status: 'not-started', owner: 'Mechanical', notes: 'Main trunk + branches', budgetedCost: 95000 },
        { id: 'A3020', name: 'Electrical Rough-In', start: '2026-06-18', end: '2026-07-01', duration: 12, status: 'not-started', owner: 'Electrician', notes: 'Panel + conduit', budgetedCost: 75000 },
        { id: 'A3030', name: 'Sprinkler Rough-In', start: '2026-06-22', end: '2026-07-01', duration: 8, status: 'not-started', owner: 'FP Sub', notes: '', budgetedCost: 35000 },
        { id: 'A3040', name: 'Fire Alarm Rough-In', start: '2026-06-29', end: '2026-07-03', duration: 5, status: 'not-started', owner: 'FA Sub', notes: '', budgetedCost: 18000 },
        { id: 'A3050', name: 'Low Voltage Rough-In', start: '2026-06-29', end: '2026-07-08', duration: 8, status: 'not-started', owner: 'LV Sub', notes: 'Cat6A + fiber', budgetedCost: 30000 },
      ],
    },
    {
      name: 'Framing & Drywall',
      activities: [
        { id: 'A4000', name: 'Metal Stud Framing', start: '2026-06-29', end: '2026-07-10', duration: 10, status: 'not-started', owner: 'Drywall Sub', notes: '', budgetedCost: 75000 },
        { id: 'A4010', name: 'In-Wall MEP Coord', start: '2026-07-13', end: '2026-07-15', duration: 3, status: 'not-started', owner: 'All Trades', notes: 'Walk-through', budgetedCost: 0 },
        { id: 'A4020', name: 'Insulation', start: '2026-07-16', end: '2026-07-18', duration: 3, status: 'not-started', owner: 'Drywall Sub', notes: 'Acoustic + rated', budgetedCost: 15000 },
        { id: 'A4030', name: 'Drywall Hang', start: '2026-07-20', end: '2026-07-29', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: '', budgetedCost: 40000 },
        { id: 'A4040', name: 'Tape & Spackle', start: '2026-07-30', end: '2026-08-08', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: 'Level 4/5', budgetedCost: 20000 },
      ],
    },
    {
      name: 'Ceiling',
      activities: [
        { id: 'A5000', name: 'ACT Grid Installation', start: '2026-08-10', end: '2026-08-14', duration: 5, status: 'not-started', owner: 'Ceiling Sub', notes: '', budgetedCost: 30000 },
        { id: 'A5010', name: 'Drywall Ceiling', start: '2026-08-06', end: '2026-08-14', duration: 8, status: 'not-started', owner: 'Drywall Sub', notes: 'Conf + reception', budgetedCost: 15000 },
        { id: 'A5020', name: 'Cloud Panels', start: '2026-08-17', end: '2026-08-19', duration: 3, status: 'not-started', owner: 'Ceiling Sub', notes: '', budgetedCost: 12000 },
      ],
    },
    {
      name: 'Finishes',
      activities: [
        { id: 'A6000', name: 'Painting', start: '2026-08-10', end: '2026-08-19', duration: 8, status: 'not-started', owner: 'Painter', notes: 'Primer + 2 coats', budgetedCost: 30000 },
        { id: 'A6010', name: 'Floor Prep', start: '2026-08-17', end: '2026-08-19', duration: 3, status: 'not-started', owner: 'Flooring Sub', notes: '', budgetedCost: 12000 },
        { id: 'A6020', name: 'Tile (Pantry/Restrooms)', start: '2026-08-20', end: '2026-08-26', duration: 5, status: 'not-started', owner: 'Tile Sub', notes: '', budgetedCost: 18000 },
        { id: 'A6030', name: 'LVT Installation', start: '2026-08-24', end: '2026-08-28', duration: 5, status: 'not-started', owner: 'Flooring Sub', notes: '', budgetedCost: 22000 },
        { id: 'A6040', name: 'Carpet Tile', start: '2026-08-27', end: '2026-09-01', duration: 4, status: 'not-started', owner: 'Flooring Sub', notes: '', budgetedCost: 33000 },
        { id: 'A6050', name: 'Base Installation', start: '2026-09-01', end: '2026-09-03', duration: 3, status: 'not-started', owner: 'Flooring Sub', notes: '', budgetedCost: 5000 },
      ],
    },
    {
      name: 'MEP Trim & Close-In',
      activities: [
        { id: 'A7000', name: 'HVAC Diffusers & Grilles', start: '2026-08-24', end: '2026-08-27', duration: 4, status: 'not-started', owner: 'Mechanical', notes: '', budgetedCost: 25000 },
        { id: 'A7010', name: 'DDC/BMS Controls', start: '2026-08-27', end: '2026-09-02', duration: 5, status: 'not-started', owner: 'Controls Sub', notes: '', budgetedCost: 35000 },
        { id: 'A7020', name: 'Electrical Devices & Fixtures', start: '2026-08-24', end: '2026-08-28', duration: 5, status: 'not-started', owner: 'Electrician', notes: '', budgetedCost: 40000 },
        { id: 'A7030', name: 'Plumbing Fixtures', start: '2026-08-27', end: '2026-09-01', duration: 4, status: 'not-started', owner: 'Plumber', notes: '', budgetedCost: 20000 },
        { id: 'A7040', name: 'Sprinkler Head Trim', start: '2026-08-27', end: '2026-08-28', duration: 2, status: 'not-started', owner: 'FP Sub', notes: '', budgetedCost: 5000 },
        { id: 'A7050', name: 'Fire Alarm Devices', start: '2026-08-27', end: '2026-08-31', duration: 3, status: 'not-started', owner: 'FA Sub', notes: '', budgetedCost: 8000 },
        { id: 'A7060', name: 'LV Terminations', start: '2026-09-01', end: '2026-09-05', duration: 5, status: 'not-started', owner: 'LV Sub', notes: '', budgetedCost: 15000 },
      ],
    },
    {
      name: 'Millwork & Specialties',
      activities: [
        { id: 'A8000', name: 'Reception Desk', start: '2026-09-01', end: '2026-09-03', duration: 3, status: 'not-started', owner: 'Millwork Sub', notes: '', budgetedCost: 35000 },
        { id: 'A8010', name: 'Pantry Cabinetry', start: '2026-09-01', end: '2026-09-05', duration: 5, status: 'not-started', owner: 'Millwork Sub', notes: '', budgetedCost: 45000 },
        { id: 'A8020', name: 'Glass Partitions', start: '2026-08-27', end: '2026-09-02', duration: 5, status: 'not-started', owner: 'Glass Sub', notes: '', budgetedCost: 65000 },
        { id: 'A8030', name: 'Signage & Wayfinding', start: '2026-09-08', end: '2026-09-09', duration: 2, status: 'not-started', owner: 'Signage Sub', notes: '', budgetedCost: 8000 },
        { id: 'A8040', name: 'Window Treatments', start: '2026-09-08', end: '2026-09-10', duration: 3, status: 'not-started', owner: 'Shade Sub', notes: '', budgetedCost: 12000 },
      ],
    },
    {
      name: 'FF&E & Closeout',
      activities: [
        { id: 'A9000', name: 'Furniture Delivery & Install', start: '2026-09-14', end: '2026-09-18', duration: 5, status: 'not-started', owner: 'Furniture Dealer', notes: '', budgetedCost: 40000 },
        { id: 'A9010', name: 'AV Install & Programming', start: '2026-09-14', end: '2026-09-17', duration: 4, status: 'not-started', owner: 'AV Sub', notes: '', budgetedCost: 45000 },
        { id: 'A9020', name: 'Access Control & CCTV', start: '2026-09-14', end: '2026-09-16', duration: 3, status: 'not-started', owner: 'Security Sub', notes: '', budgetedCost: 20000 },
        { id: 'A9030', name: 'Punch List Walk', start: '2026-09-21', end: '2026-09-23', duration: 3, status: 'not-started', owner: 'A/E + Owner', notes: '', budgetedCost: 0 },
        { id: 'A9040', name: 'Punch List Completion', start: '2026-09-24', end: '2026-09-30', duration: 5, status: 'not-started', owner: 'All Trades', notes: '', budgetedCost: 0 },
        { id: 'A9050', name: 'TAB (Test & Balance)', start: '2026-09-21', end: '2026-09-23', duration: 3, status: 'not-started', owner: 'TAB Contractor', notes: '', budgetedCost: 15000 },
        { id: 'A9060', name: 'Commissioning', start: '2026-09-24', end: '2026-09-26', duration: 3, status: 'not-started', owner: 'Cx Agent', notes: '', budgetedCost: 20000 },
        { id: 'A9070', name: 'DOB / FDNY Inspections', start: '2026-09-28', end: '2026-09-30', duration: 3, status: 'not-started', owner: 'Expediter', notes: '', budgetedCost: 8000 },
        { id: 'A9080', name: 'Final Clean', start: '2026-10-01', end: '2026-10-02', duration: 2, status: 'not-started', owner: 'Cleaning', notes: '', budgetedCost: 12000 },
        { id: 'A9090', name: 'Substantial Completion', start: '2026-10-05', end: '2026-10-05', duration: 1, status: 'not-started', owner: 'GC', notes: 'TCO', budgetedCost: 0 },
        { id: 'A9100', name: 'Move-In', start: '2026-10-06', end: '2026-10-09', duration: 3, status: 'not-started', owner: 'Tenant', notes: '', budgetedCost: 0 },
      ],
    },
  ],
};
